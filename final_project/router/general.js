const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (username && password) {
		if (!isValid(username)) {
			users.push({ username, password });
			return res
				.status(200)
				.json({ message: "User successfully registered. Now you can login" });
		} else {
			return res.status(400).json({ message: "User already exists!" });
		}
	}
	return res
		.status(400)
		.json({ message: "Username and password are required" });
});

public_users.get("/", function (req, res) {
	new Promise((resolve, reject) => {
		if (books) {
			resolve(books);
		} else {
			reject("No books available");
		}
	})
		.then((data) => res.status(200).send(JSON.stringify(data, null, 2)))
		.catch((err) => res.status(500).json({ message: err }));
});

public_users.get("/isbn/:isbn", function (req, res) {
	const isbn = req.params.isbn;
	new Promise((resolve, reject) => {
		if (books[isbn]) {
			resolve(books[isbn]);
		} else {
			reject("Book not found");
		}
	})
		.then((data) => res.status(200).send(JSON.stringify(data, null, 2)))
		.catch((err) => res.status(404).json({ message: err }));
});

public_users.get("/author/:author", function (req, res) {
	const author = req.params.author.toLowerCase();
	new Promise((resolve, reject) => {
		const matchingBooks = Object.values(books).filter((book) =>
			book.author.toLowerCase().includes(author)
		);
		if (matchingBooks.length > 0) {
			resolve(matchingBooks);
		} else {
			reject("No books found by this author");
		}
	})
		.then((data) => res.status(200).send(JSON.stringify(data, null, 2)))
		.catch((err) => res.status(404).json({ message: err }));
});

public_users.get("/title/:title", function (req, res) {
	const title = req.params.title.toLowerCase();
	new Promise((resolve, reject) => {
		const matchingBooks = Object.values(books).filter((book) =>
			book.title.toLowerCase().includes(title)
		);
		if (matchingBooks.length > 0) {
			resolve(matchingBooks);
		} else {
			reject("No books found with this title");
		}
	})
		.then((data) => res.status(200).send(JSON.stringify(data, null, 2)))
		.catch((err) => res.status(404).json({ message: err }));
});

public_users.get("/review/:isbn", function (req, res) {
	const isbn = req.params.isbn;
	if (books[isbn]) {
		res.status(200).send(JSON.stringify(books[isbn].reviews, null, 2));
	} else {
		res.status(404).json({ message: "Book not found" });
	}
});

module.exports.general = public_users;
