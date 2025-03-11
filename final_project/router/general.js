const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let regd_users = require("./auth_users.js").authenticated; 
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
      return res.status(409).json({ message: "Username already exists. Please choose another." });
  }

  // Register the new user
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully", username });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {  
  return res.status(200).json(JSON.stringify(books, null, 2));  
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
      return res.status(200).json(books[isbn]);
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const results = Object.values(books).filter(book => book.author === author);

  if (results.length > 0) {
      return res.status(200).json(results);
  } else {
      return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const results = Object.values(books).filter(book => book.title === title);

  if (results.length > 0) {
      return res.status(200).json(results);
  } else {
      return res.status(404).json({ message: "No books found with this title" });
  }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn] && books[isbn].reviews) {
      return res.status(200).json(books[isbn].reviews);
  } else {
      return res.status(404).json({ message: "Reviews not found" });
  }
});


public_users.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.find(user => user.username === username)) {
      return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
      const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });
      req.session.token = token;
      return res.status(200).json({ message: "Login successful", token });
  } else {
      return res.status(401).json({ message: "Invalid credentials" });
  }
});



regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user?.username;

  if (!username) {
      return res.status(401).json({ message: "Unauthorized" });
  }

  if (books[isbn]) {
      books[isbn].reviews = books[isbn].reviews || {};
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review added/modified successfully" });
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user?.username;

  if (!username) {
      return res.status(401).json({ message: "Unauthorized" });
  }

  if (books[isbn] && books[isbn].reviews && books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
  } else {
      return res.status(404).json({ message: "Review not found" });
  }
});

const axios = require('axios');

// Task 10: Get list of books
public_users.get("/", async (req, res) => {
    try {
        const books = await axios.get('http://localhost:5000/books');
        res.status(200).json(books.data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books" });
    }
});

// Task 11: Get book details by ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
      const book = await axios.get(`http://localhost:5000/books/${isbn}`);
      res.status(200).json(book.data);
  } catch (error) {
      res.status(404).json({ message: "Book not found" });
  }
});

// Task 12: Get books by author
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
      const response = await axios.get('http://localhost:5000/books');
      const books = Object.values(response.data).filter(
          book => book.author.toLowerCase() === author.toLowerCase()
      );
      res.status(200).json(books);
  } catch (error) {
      res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Task 13: Get books by title
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
      const response = await axios.get('http://localhost:5000/books');
      const books = Object.values(response.data).filter(
          book => book.title.toLowerCase().includes(title.toLowerCase())
      );
      res.status(200).json(books);
  } catch (error) {
      res.status(500).json({ message: "Error fetching books by title" });
  }
});




module.exports.general = public_users;
