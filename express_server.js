const { generateRandomID, generateRandomString, getUserByEmail, urlsForUser } = require("./helper"); 

const express = require("express"); //imported express
const bodyParser = require("body-parser"); //imported body parser
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const app = express(); //setting app to the express function 
const PORT = 8080; // default port 8080

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'] //keys = used in encryption and decryption process, additional security measures
}));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true})); //using body parser for urlencoding?
app.set("view engine", "ejs"); //setting the view engine to ejs 

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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
};      //"/" area is route area // root directory
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
  const user = users[req.session.user_id]
  const templateVars = { 
    user,
    urls: urlsForUser(user, urlDatabase)
  };
  res.render("urls_index", templateVars) //render using urls_index for the value of templateVars
});
app.get("/urls/new", (req, res) => { //get the response for urls/new and I want to render what I have on urls_new
  const user = users[req.session.user_id]
  if(!user) {
    return res.redirect("/login")
  }
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
  });
app.get("/urls/:shortURL", (req, res) => { //when given a shortURL 
  const user = users[req.session.user_id]
  if(!user) {
    return res.send(404)
  }
  const templateVars = {
    shortURL: req.params.shortURL, // when you do the get req. the req is the object of the url. params is one of the keys and :shortURL is the value of that key
    longURL: urlDatabase[req.params.shortURL].longURL,
    user
  }; // need clarification  
  res.render("urls_show", templateVars); // I want to render urls_show with templateVars 
}); //shortURL sets those values that we need to have and then get passed on 
//is the path :id the colon is a placeholder. 
app.get("/u/:shortURL", (req, res) => { // need clarification 
  const user = users[req.session.user_id]
  if(!user) {
    return res.send(404)
  }
  if (!urlDatabase[req.params.shortURL]) {
    return res.send(404)
  }
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL)
});
app.post("/urls", (req, res) => { // need clarification
  const user = users[req.session.user_id]
  if(!user) {
    return res.send("Uh-oh... Are you logged in?")
  }
  const longURL = req.body.longURL
  const shortURL = generateRandomString() 
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: user};

  //the value of longURL that's in shortURL in the ulrdatabase object
  res.redirect(`/urls/${shortURL}`);
}); // cannot test post requests // get = no body, checking information it already has // post = sending new information to the backend -> processing 
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id]
  if(!user) {
    return res.send("Please log in")
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});
app.get("/urls/:shortURL/edit", (req, res) => {
  // const user = users[req.cookies["user_id"]] //the user id value in cookies in users object -> all the info with it 
  const user = users[req.session.user_id]
  if(!user) {
    return res.send(404)
  }
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user
};
  res.render("urls_show", templateVars); //render builds a page
});
app.get("/register", (req, res) =>  {
  const templateVars = {user: null};
  const user = users[req.session.user_id]
  if(user) {
    return res.redirect("/urls")
  }
  res.render("registeration_page", templateVars)
});
app.get("/login", (req, res) => {
  const user = users[req.session.user_id]
  if(user) {
    return res.redirect("/urls")
  }
  const templateVars = {
    user
  }
  res.render("login", templateVars)
});
app.post("/register", (req, res) => { //post expects info from front end // get is backend telling front end 
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if(!email || !hashedPassword) {
    res.send(400)
    return
  };
  const emailExists = getUserByEmail(email, users);
  if(emailExists) {
    res.send(400)
    return
  };
  const Id = generateRandomID();
  users[Id] = {
    id: Id,
    email: req.body.email,
    password: hashedPassword
  };
  // res.cookie("user_id", Id) //"userId" = just an identifier Id value === login value // cookies are objects
  req.session.user_id = Id; //cookies can be edited, sessions are mixed in keys so it's harder to decipher
  res.redirect("/urls");

});
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL; //urlDatabase[shorturl] = lo // shortURL is the key and the longURL is the value 
  res.redirect("/urls");
});
// https://www.youtube.com/c/TraversyMedia/videos
app.post("/login", (req, res) => {
  // const id = req.body["user_id"]; //req.body["user_id"] = email login info 
  const {email, password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = getUserByEmail(email, users);
  if(!user) {
    res.send(403) //res.status(400).send(msg)
    return
  } 
  if(bcrypt.compareSync(user.password, hashedPassword)) {
    res.send(403)
    return //terminate function don't run anything after this point if condition is met
  }
  // res.cookie("user_id", user.id); //"user_id" === id === email 
  req.session.user_id = user.id; //session ID is now === user.id from the database
  res.redirect("/urls");
});
app.post("/logout", (req, res) => { //check on this 
  req.session = null
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