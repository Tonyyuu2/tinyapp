const express = require("express"); //imported express
const bodyParser = require("body-parser"); //imported body parser
const app = express(); //setting app to the express function 
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true})); //using body parser for urlencoding?
app.set("view engine", "ejs"); //setting the view engine to ejs 

function generateRandomString() { // generates random alphanumeric characters
  return Math.random().toString(36).slice(-6);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


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
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars) //render using urls_index for the value of templateVars
});

app.get("/urls/new", (req, res) => { //get the response for urls/new and I want to render what I have on urls_new
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => { //when given a shortURL 
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}; // need clarification 
  res.render("urls_show", templateVars); // I want to render urls_show with templateVars
});

app.get("/u/:shortURL", (req, res) => { // need clarification 
 const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL)
})

app.post("/urls", (req, res) => { // need clarification 
  const longURL = req.body.longURL
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});




app.listen(PORT, () => { //telling server to listen to this port 
  console.log(`Example app listening on port ${PORT}!`);
});