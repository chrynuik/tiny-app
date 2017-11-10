const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.use(cookieParser());

app.use(express.static('public'));

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": 'http://www.google.com'
};

let rString = generateRandomString('0123456789abcdefghijklmnopqrstuvwxyz', 6);

let randomId= generateRandomString('0123456789abcdefghijklmnopqrstuvwxyz', 12);

//delete the short url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls/');
});

///edit the long url
app.post("/urls/:id", (req, res) =>{
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

//login
app.get("/login", (req, res) => {
  const user_id = req.cookies["id"];
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


  // let templateVars = {
  //   urls : urlDatabase,
  //   email: req.body.email,
  //   id: req.body.id,
  //   user_id: req.cookies["id"]
  // };
  res.render("login", templateVars);
})
app.post("/login", (req, res) =>{
  let user = null;

  if (req.cookies["id"]){
    res.redirect("/urls");
    return;
  }

  //find user
  for (user_Id in users) {
    const currentUser = users[user_Id];
    if (currentUser.email === req.body.email) {
      user = currentUser;
      break;

    }

  }
  //if email doesn't exist give 403 error
  if (!user) {
    res.status(403).send("email not found");
  }
  //set cookie
  res.cookie("id", user.id);
  res.redirect(`/urls/`);
});



//registration process
app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.body.id,
    email: req.body.email,
    id: req.body.id
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {


  const email = req.body.email;
  const password = req.body.password;

  let id = randomId;

  console.log(email);

  if (!email && !password) {
      res.status(400).send("ooops!");
  }
    for (index in users) {
      if (email === users[index].email) {
        res.status(400).send("email already exists");
      }
    }

    users[id] = {
      "id": id,
      "email": email,
      "password": password

    };

    let user_id = res.cookie("id", id) ;

    res.redirect("/urls/");
});

//logout
app.post("/logout", (req, res) => {

  res.clearCookie("id");

  res.redirect(`/urls/`)
});

//root
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies["id"];
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
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["id"];
  let user = users[user_id];

  //if user is not logged in redirect to /login
  if (!user) {
    res.redirect("/login");
  }

  let templateVars = {
    urls : urlDatabase,
    id: user.id,
    email: user.email,
    user_id: user_id
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const user_id = req.cookies["id"];
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
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies["id"];
  let user = users[user_id];
  if (!user) {
    user = {};
  }

  let templateVars = {
    urls : urlDatabase,
    id: user.id,
    email: user.email,
    shortURL: req.params.id,
    user_id: user_id
  };
  res.render("urls_show", templateVars);
});



app.post("/urls", (req, res) => {
  console.log(req.body);
  urlDatabase[rString] = req.body['longURL'];
  res.redirect(`/urls/${rString}`);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});




function generateRandomString(chars, length) {
    let result = '';
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}