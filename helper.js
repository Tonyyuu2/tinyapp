const bcrypt = require("bcryptjs");

const generateRandomString = () => {
  return Math.random().toString(36).slice(-6);
};

const generateRandomID = () => {
  return Math.random().toString(36).slice(-5);
};

const getUserByEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) { //the email inside user object within the users object
      return users[userId]; //returns the value of userID inside users object
    }
  }
  return false;
};
const urlsForUser = (id, database) => {
  let userUrls = {};
  if (!id) {
    return null;
  }
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls;
};
const authenticateUser = (email, password, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      //because the email matched, now we will check the password
      if (bcrypt.compareSync(password, users[user].password)) {
        return users[user];
      }
    }
  }
  return false;
};
module.exports = {
  generateRandomID,
  generateRandomString,
  getUserByEmail,
  urlsForUser,
  authenticateUser
};