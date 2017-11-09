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
  console.log("username before settign cookie" + username);
  username = res.cookie("username", username) ;
  console.log(username);

  res.redirect(`/urls/`);
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
  let templateVars = { urls : urlDatabase};
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL)
})
app.get("/urls/:id", (req, res) => {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id };
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


let rString = generateRandomString('0123456789abcdefghijklmnopqrstuvwxyz', 6);

function generateRandomString(chars, length) {
    let result = '';
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}