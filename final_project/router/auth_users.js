const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  const usrName = username;
  const userFound = users.find(({username}) => username == usrName);
  if (userFound) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  if (isValid(username)) {
    const usrName = username;
    const userFound = users.find(({username}) => username == usrName);
    if (userFound) {
      if (userFound.password === password) {
        return true;
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  if (!req.body.username || !req.body.password){
    return res.status(401).json({message: "Login Failed!"});
  }
  
  const userStatus = authenticatedUser(req.body.username, req.body.password);
  const usrName = req.body.username;
  const usrPassword = req.body.password;

  if (userStatus) {
    let accessToken = jwt.sign({
      data: usrPassword
    }, 'access', { expiresIn: 60 * 60}); //60 * 60

    req.session.authorization = {
      accessToken, usrName
    }
    return res.status(200).json({message: "User: " + usrName + " successfully logged in, Users JWT Access Token is: " + accessToken});
  }
  return res.status(401).json({message: "Login Failed!"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = parseInt(req.params.isbn);
  let reviewResult = [];
  let reviewSection = [];
  let reviewFound = {};

  for (const item in books) {

      if (parseInt(books[item].isbn) == parseInt(isbn)) {
        reviewSection = books[item].reviews.review
        
        if (reviewSection.length > 0) {
          reviewSection.forEach(reviewItem => {
            if (reviewItem.user == req.session.authorization.usrName) {
              reviewFound = reviewItem;
            };
          });
        }

        if (reviewSection[reviewSection.indexOf(reviewFound)]) {
          reviewSection[reviewSection.indexOf(reviewFound)] = {"user":req.session.authorization.usrName, "reviewtext":req.query.review}
        } else {
          reviewSection.push({"user":req.session.authorization.usrName, "reviewtext":req.query.review});
        }
        
        books[item].reviews = {"review": reviewSection};
        reviewResult.push(books[item])
        if (JSON.stringify(books[item].reviews) == '{"review": []}') {
          reviewResult.push(JSON.parse('{"message":"No Review Found for Book with ISBN: ' + books[item].isbn + '"}'));
        }
        
        return res.send(reviewResult);
      }
  }
  return res.status(404).json({message: "ISBN " + isbn + " not Found!"});
});

// Delete User book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = parseInt(req.params.isbn);
  let reviewResult = [];
  let reviewSection = [];
  let reviewFound = {};

  for (const item in books) {

      if (parseInt(books[item].isbn) == parseInt(isbn)) {
        reviewSection = books[item].reviews.review
        
        if (reviewSection.length > 0) {
          reviewSection.forEach(reviewItem => {
            if (reviewItem.user == req.session.authorization.usrName) {
              reviewFound = reviewItem;
            };
          });
        }

        if (reviewSection[reviewSection.indexOf(reviewFound)]) {
          const foundIndex = reviewSection.indexOf(reviewFound);

          if (foundIndex == 0) {
            reviewSection.shift();
          } else if (foundIndex == (reviewSection.length - 1)) {
            reviewSection.pop();
          } else {
            const tempArray1 = reviewSection.slice(0,foundIndex);
            const tempArray2 = reviewSection.slice(foundIndex + 1);
            reviewSection = tempArray1.concat(tempArray2);
          }
        }
        
        books[item].reviews = {"review": reviewSection};
        reviewResult.push(books[item])
        if (JSON.stringify(books[item].reviews) == '{"review": []}') {
          reviewResult.push(JSON.parse('{"message":"No Review Found for Book with ISBN: ' + books[item].isbn + '"}'));
        }
        
        return res.send(reviewResult);
      }
  }
  return res.status(404).json({message: "ISBN " + isbn + " not Found!"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
