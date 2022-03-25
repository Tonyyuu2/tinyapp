const express = require("express"); //imported express
const bodyParser = require("body-parser"); //imported body parser
const morgan = require('morgan');
const cookieParser = require("cookie-parser");
const app = express(); //setting app to the express function 
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true})); //using body parser for urlencoding?
app.set("view engine", "ejs"); //setting the view engine to ejs 

function generateRandomString() { // generates random alphanumeric characters
  return Math.random().toString(36).slice(-6);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

        //"/" area is route area // root directory
app.get("/", (req, res) => { // req = request res = response
  res.send("Hello!"); //sends hello to the browser
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //gets the json response of the urldatabase object
});

app.get("/hello", (req, res) => { //on the local host/hello, send this...
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/urls", (req, res) => { // on the urls page, response, I want to render with ejs and post 
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars) //render using urls_index for the value of templateVars
});

app.get("/urls/new", (req, res) => { //get the response for urls/new and I want to render what I have on urls_new
  const templateVars = { 
    username: req.cookies["username"]
  };
    res.render("urls_new", templateVars);
  });

app.get("/urls/:shortURL", (req, res) => { //when given a shortURL 
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL, // when you do the get req. the req is the object of the url. params is one of the keys and :shortURL is the value of that key
    longURL: urlDatabase[req.params.shortURL]
  }; // need clarification  
  res.render("urls_show", templateVars); // I want to render urls_show with templateVars 
}); //shortURL sets those values that we need to have and then get passed on 
        //is the path :id the colon is a placeholder.
app.get("/u/:shortURL", (req, res) => { // need clarification 
 const longURL = urlDatabase[req.params.shortURL]
 const templateVars = { 
  username: req.cookies["username"]
};
  res.redirect(longURL, templateVars)
});

app.post("/urls", (req, res) => { // need clarification 
  const longURL = req.body.longURL
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
};
  res.render("urls_show", templateVars); //render builds a page 
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL; //urlDatabase[shorturl] = lo // shortURL is the key and the longURL is the value 
  res.redirect("/urls");
});
// https://www.youtube.com/c/TraversyMedia/videos

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const username = req.body.username;
  res.clearCookie("username")
  res.redirect("/urls")
});

app.listen(PORT, () => { //telling server to listen to this port 
  console.log(`Example app listening on port ${PORT}!`);
});

//req.params = an object that holds all the parameters from the URL 
// nodemon is middleware
// <%= id %> is a dynamic tag that brings in the variable 
//res.render('____') brings and connects the ejs file with the server file
//middleware is software that will run on every request  
//why does code break when I dont aad username: req.cookies["username"]