const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  if (req.body.username && req.body.password) {
    const userFound = users.find(({username}) => username == req.body.username);
    if (!userFound) {
      users.push({"username": req.body.username,"password": req.body.password})
      return res.status(200).json({message: "User name: " + req.body.username + " has been Registered!"});
    } else {
      return res.status(409).json({message: "User name: " + req.body.username + " is the same as an Existing User Name!"});
    }
  } else {
    return res.status(406).json({message: "Please provide User Name and Password in the Body"});
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  //Code Changed to use Promise
  let listPromise = new Promise((resolve, reject) => {
    resolve(JSON.stringify({books}));
    reject("Error!");
  });

  listPromise.then(
    (value) => {
      return res.send(value);
    },
    (error) => {
      return res.send(error);
    }
  );

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  //Code Changed to use Promise
  const isbn = parseInt(req.params.isbn);
  let resultPromise = {};
  let listIsbnPromise = new Promise((resolve, reject) => {
    for (const item in books) {
      if (parseInt(books[item].isbn) == parseInt(isbn)) {
        resultPromise = books[item];
      }
    }
    if (JSON.stringify(resultPromise) == "{}") {
      resultPromise = {message: "ISBN " + isbn + " not Found!"};
    }
    resolve(JSON.stringify(resultPromise));
    reject("Error!");
  });
  listIsbnPromise.then(
    (value) => {
      return res.send(value);
    },
    (error) => {
      return res.send(error);
    }
  );
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  //Code Changed to use Promise
  const author = req.params.author;
  let booksArray = [];
  let resultPromise;
  let listAuthorPromise = new Promise((resolve, reject) => {
    for (const item in books) {
      if (books[item].author == author) {
        booksArray.push(books[item]);
      }
    }
    if (booksArray.length > 0) {
      resultPromise = booksArray;
    } else if (booksArray.length == 0) {
      resultPromise ={message: "Author " + author + " not Found!"};
    }
    resolve(JSON.stringify(resultPromise));
    reject("Error!");
  });
  listAuthorPromise.then(
    (value) => {
      return res.send(value);
    },
    (error) => {
      return res.send(error);
    }
  );
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  //Code Changed to use Promise
  const title = req.params.title;
  let booksArray = [];
  let resultPromise;
  let listAuthorPromise = new Promise((resolve, reject) => {
    for (const item in books) {
      if (books[item].title == title) {
        booksArray.push(books[item]);
      }
    }
    if (booksArray.length > 0) {
      resultPromise = booksArray;
    } else if (booksArray.length == 0) {
      resultPromise ={message: "Title " + title + " not Found!"};
    }
    resolve(JSON.stringify(resultPromise));
    reject("Error!");
  });
  listAuthorPromise.then(
    (value) => {
      return res.send(value);
    },
    (error) => {
      return res.send(error);
    }
  );
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = parseInt(req.params.isbn);
  let reviewResult = [];
  let noReview = "";

  for (const item in books) {

      if (parseInt(books[item].isbn) == parseInt(isbn)) {
        reviewResult.push(books[item])
        
        if (JSON.stringify(books[item].reviews) == '{"review": []}') {
          reviewResult.push(JSON.parse('{"message":"No Review Found for Book with ISBN: ' + books[item].isbn + '"}'));
        }
        
        return res.send(reviewResult);
      }
  }
  return res.status(404).json({message: "ISBN " + isbn + " not Found!"});
});

module.exports.general = public_users;
