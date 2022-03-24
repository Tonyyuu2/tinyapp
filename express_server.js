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
};

function generateRandomID() {
  return Math.random().toString(36).slice(-5)
};

const userLookUp = (email, users) => {
  for (const user in users) {
    if(users[user].email === email) { //the email inside user object within the users object
      return user
    };
  }
  return false
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "12345"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "6789"
  }
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
  const user = users[req.cookies["user_id"]]
  const templateVars = { 
    user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars) //render using urls_index for the value of templateVars
});

app.get("/urls/new", (req, res) => { //get the response for urls/new and I want to render what I have on urls_new
  const user = users[req.cookies["user_id"]]
  const templateVars = { 
    user
  };
    res.render("urls_new", templateVars);
  });

app.get("/urls/:shortURL", (req, res) => { //when given a shortURL 
  const user = users[req.cookies["user_id"]]
  const templateVars = {
    username: req.cookies["user_id"],
    shortURL: req.params.shortURL, // when you do the get req. the req is the object of the url. params is one of the keys and :shortURL is the value of that key
    longURL: urlDatabase[req.params.shortURL],
    user
  }; // need clarification  
  res.render("urls_show", templateVars); // I want to render urls_show with templateVars 
}); //shortURL sets those values that we need to have and then get passed on 
        //is the path :id the colon is a placeholder.
app.get("/u/:shortURL", (req, res) => { // need clarification 
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL)
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
  const user = users[req.cookies["user_id"]] //the user id value in cookies in users object -> all the info with it 
  const templateVars = {shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user
};
  res.render("urls_show", templateVars); //render builds a page 
});

app.get("/register", (req, res) => {
  const templateVars = {user: null};
  res.render("registeration_page", templateVars)
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = {
    user
  }
  res.render("login", templateVars)
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) {
    res.send(400)
    return
  };
  const emailExists = userLookUp(email, users);
  if(emailExists) {
    res.send(400)
    return
  };
  const Id = generateRandomID();
  users[Id] = {
    id: Id,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", Id) //"userId" = just an identifier Id value === login value 
  res.redirect("/urls");

});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL; //urlDatabase[shorturl] = lo // shortURL is the key and the longURL is the value 
  res.redirect("/urls");
});
// https://www.youtube.com/c/TraversyMedia/videos

app.post("/login", (req, res) => {
  const id = req.body["user_id"]; //req.body["user_id"] = email login info 
  res.cookie("user_id", id); //"user_id" === id === email 
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
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
//why does code break when I dont aadd username: req.cookies["username"]