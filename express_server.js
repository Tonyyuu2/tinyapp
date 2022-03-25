const { generateRandomID, generateRandomString, getUserByEmail, urlsForUser, authenticateUser } = require("./helper");

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'] 
}));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

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
    password: bcrypt.hashSync("12345", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("6789", 10)
  }
};

//GET
app.get("/register", (req, res) =>  {
  const templateVars = {user: null};
  const user = users[req.session.user_id];
  
  if (user) {
    return res.redirect("/urls");
  }
  
  res.render("registeration_page", templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user
  };

  res.render("login", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    user,
    urls: urlsForUser(userID, urlDatabase)
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  
  if (!user) {
    return res.send(404);
  }

  if (!urlDatabase[req.params.shortURL]) {
    return res.send(404);
  }

  const longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
 
  if (!user) {
    return res.send(404);
  }

  const shortURL = req.params.shortURL;
  const userUrls = urlsForUser(req.session.user_id, urlDatabase);
  
  if (!userUrls[shortURL]) {
    return res.send(404);
  }

  const templateVars = {
    shortURL,
    longURL: userUrls[shortURL].longURL,
    user
  };

  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const user = users[req.session.user_id];
  
  if (!user) {
    return res.send(404);
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user
  };

  res.render("urls_show", templateVars);
});

//POST
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    res.send(400);
    return;
  }
 
  const emailExists = getUserByEmail(email, users);
  if (emailExists) {
    res.send(400);
    return;
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  const Id = generateRandomID();

  users[Id] = {
    id: Id,
    email: req.body.email,
    password: hashedPassword
  };

  req.session.user_id = Id;
  res.redirect("/urls");

});

app.post("/login", (req, res) => {
  const {email, password} = req.body;
 
  if (!email || !password) {
    res.send("Hey! Please enter email and password");
  }
 
  let user = authenticateUser(email, password, users);
  
  if (user) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.send("Hey! Please try again. Either the email or password does not match");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  
  if (!user) {
    return res.send("Uh-oh... Are you logged in?");
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: user.id};

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];
  
  if (!user) {
    return res.send("Please log in");
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  
  urlDatabase[shortURL].longURL = longURL;
  
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
