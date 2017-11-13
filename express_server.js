const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
//const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use(express.static('public'));

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hashPassword("purple")
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hashPassword("dishwasher-funk")
  }
};


let urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userId: "userRandomID",
  },
  "9sm5xK": {
    url: 'http://www.google.com',
    userId: "user2RandomID"
  }
};

function generateRandomString(chars, length) {
  let result = '';
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

//create function that loops through looking for short urls that have user id and user looking return new object with only matching short links then set that to a variable
function findUser(users, email) {
  for (let user_Id in users) {
  const currentUser = users[user_Id];
    if (currentUser.email === email) {
      return currentUser;

    }
  }
}

function matchUserToUrls(user_id) {
  let matchingUrlDatabase = {};
  for (let each in urlDatabase) {
    if (urlDatabase[each].userId === user_id) {
      matchingUrlDatabase[each] = {
        url: urlDatabase[each].url,
        userID: urlDatabase[each].userId
      };
    }
  }
  return matchingUrlDatabase;
}

//check if user password and email match
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}
function validatePassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}



//delete the short url
app.post("/urls/:id/delete", (req, res) => {
  // check to see if the user's id matches the url's userId first
  delete urlDatabase[req.params.id];
  res.redirect('/urls/');
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  let user = users[user_id];

  //if user is not logged in redirect to /login
  if (!user) {
    res.redirect("/login");
    return;
  }

  let templateVars = {
    urls : urlDatabase,
    id: user.id,
    email: user.email,
    user_id: user_id
  };
  res.render("urls_new", templateVars);
});

app.use("/urls/:id/:action?", (req, res, next) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(403).send("Url does not exist");

  } else {
    next();
    return;
  }
});

app.use("/u/:id/:action?", (req, res, next) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(403).send("Url does not exist");

  } else {
    next();
    return;
  }
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  let user = users[user_id];
  // let matchFound = false;
  if (!user) {
    res.redirect("/login");
    return;
  }
  let templateVars = {
    urls : urlDatabase,
    id: user.id,
    email: user.email,
    user_id: user_id,
    shortURL: req.params.id
  };

  res.render("urls_show", templateVars);

});

///edit the long url
app.post("/urls/:id", (req, res) =>{

  for (let userId in users) {
    if (userId === req.session.user_id) {
      urlDatabase[req.params.id] = {
        url: req.body.longURL,
        userId: userId
      };
      return res.redirect(`/urls`);
    }
  }
  res.redirect("/urls");

});

//login
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  let user = users[user_id];
  if (!user) {
    user = {};
  }
  if (!user.email) {
    email="";
  }

  let templateVars = {
    urls : urlDatabase,
    id: user.id,
    email: user.email,
    user_id: user_id
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) =>{
  const email = req.body.email;
  const password = req.body.password;
  if (req.session.user_id){
    res.redirect("/urls");
    return;
  }
  //find user
  let user = findUser(users, email);



  //if email doesn't exist give 403 error
  if (!user) {
    return res.status(403).send("email not found");
  }

  let validatedPassword = validatePassword(password, user.password);

  if (!validatedPassword) {
    return res.status(403).send("incorrect password");
  } else {
    req.session.user_id = user.id;

    res.redirect(`/urls/`);
  }

});

//registration process
app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  let user = users[user_id];

   if (!user) {
    user = {};
  }

  let templateVars = {
    urls : urlDatabase,
    id: user.id,
    email: user.email,
    user_id: user_id
  };

  res.render("register", templateVars);

});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = hashPassword(password);
  let id = generateRandomString('0123456789abcdefghijklmnopqrstuvwxyz', 12);;

  if (!email && !password) {
      res.status(400).send("Ooops doesn't look like you filled out the form.");
  }
    for (index in users) {
      if (email === users[index].email) {
        res.status(400).send("email already exists");
      }
    }

  users[id] = {
    "id": id,
    "email": email,
    "password": hashedPassword

  };

  req.session.user_id = id;

  res.redirect("/urls/");
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls/`)
});

//root
app.get("/", (req, res) => {
  const user_id = req.session.user_id;
  let user = users[user_id];
  if (!user) {
    res.redirect("/login");
    return;
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  let user = users[user_id];

  if (!user) {
    user = {};
  }

  let urlsMatch = matchUserToUrls(user_id);

  let templateVars = {
    urls : urlsMatch,
    id: user.id,
    email: user.email,
    user_id: user_id
  };

  res.render("urls_index", templateVars);

});



app.get("/u/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  let user = users[user_id];

  let longURL = urlDatabase[req.params.shortURL].url;

  if (!user) {
    user = {};
  }

  let templateVars = {
    urls : urlDatabase,
    id: user.id,
    email: user.email,
    user_id: user_id,
    shortURL: req.params.id

  };

  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let rString = generateRandomString('0123456789abcdefghijklmnopqrstuvwxyz', 6);

  let longURL = req.body['longURL'];
  let userId = req.session.user_id;
  urlDatabase[rString] = {
    userId : userId,
    url: longURL
  };
  res.redirect(`/urls/${rString}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});




