function generateRandomString() { // generates random alphanumeric characters
  return Math.random().toString(36).slice(-6);
};

function generateRandomID() {
  return Math.random().toString(36).slice(-5)
};

const getUserByEmail = (email, users) => {
  for (const userId in users) {
    if(users[userId].email === email) { //the email inside user object within the users object
      return users[userId] //returns the value of userID inside users object
    };
  }
  return false
};

const urlsForUser = (id, database) => {
  let userUrls = {}; 
  if(!id) {
    return null
  }
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL]
    }
  }
  return userUrls;
};

module.exports = {
  generateRandomID,
  generateRandomString,
  getUserByEmail,
  urlsForUser
};