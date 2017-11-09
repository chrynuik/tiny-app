const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": 'http://www.google.com'
};

let rString = generateRandomString('0123456789abcdefghijklmnopqrstuvwxyz', 6);

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
app.post("/login", (req, res) =>{
  let username = req.body.username;
  username = res.cookie("username", username) ;
  res.redirect(`/urls/`);
});

//logout
app.post("/logout", (req, res) => {
  // let username = req.body.username;
  // username = res.cookie("username", undefined) ;
  res.clearCookie("username");

  res.redirect(`/urls/`)
});

//register
app.get("/register", (req, res) => {
  let templateVars = {
    email: req.body.email,
    password: req.body.password,
    username: req.body.username
  }
  res.render("register", templateVars);
});
app.post("/register", (req, res) => {
  const {email, code} = req.bod;

  res.redirect("/register/");
});
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n")
})

app.get("/urls", (req, res) => {
  let templateVars = {
    urls : urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls : urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL)
})
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    urls: urlDatabase, shortURL: req.params.id,
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});



app.post("/urls", (req, res) => {
  console.log(req.body);
  urlDatabase[rString] = req.body['longURL'];
  res.redirect(`/urls/${rString}`);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT} ${rString}`);
});




function generateRandomString(chars, length) {
    let result = '';
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}