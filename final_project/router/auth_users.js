const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check if username exists in the user list
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  // Check if username and password match an existing user
  const user = users.find(user => user.username === username && user.password === password);
  return user !== undefined;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, "secret_key", { expiresIn: '1h' });
  req.session.token = token;

  return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  if (!req.session.token) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  let decoded;
  try {
    decoded = jwt.verify(req.session.token, "secret_key");
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }

  const username = decoded.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or modify review
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/modified successfully", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const token = req.session.token;

  if (!token) {
      return res.status(403).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(token, "access", (err, decoded) => {
      if (err) {
          return res.status(403).json({ message: "Unauthorized: Invalid token" });
      }

      const username = decoded.username;
      const book = books[isbn];

      if (!book || !book.reviews || !book.reviews[username]) {
          return res.status(404).json({ message: "Review not found or book does not exist" });
      }

      // Delete the review for the user
      delete book.reviews[username];

      return res.status(200).json({ message: "Review deleted successfully" });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
