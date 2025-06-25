const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
	return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
	return users.some(
		(user) => user.username === username && user.password === password
	);
};

//only registered users can login
regd_users.post("/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (!username || !password) {
		return res
			.status(400)
			.json({ message: "Username and password are required" });
	}

	if (authenticatedUser(username, password)) {
		let accessToken = jwt.sign({ username }, "access", { expiresIn: 60 * 60 });
		req.session.authorization = { accessToken, username };
		return res.status(200).json({ message: "User successfully logged in" });
	} else {
		return res.status(401).json({ message: "Invalid username or password" });
	}
});

regd_users.put("/auth/review/:isbn", (req, res) => {
	const isbn = req.params.isbn;
	const review = req.body.review;
	const username = req.session.authorization?.username;

	if (!username) {
		return res.status(403).json({ message: "User not logged in" });
	}

	if (!books[isbn]) {
		return res.status(404).json({ message: "Book not found" });
	}

	if (!review) {
		return res.status(400).json({ message: "Review is required" });
	}

	books[isbn].reviews[username] = review;
	return res
		.status(200)
		.json({
			message: `Review for book with ISBN ${isbn} added/updated by ${username}`,
		});
});

// Add a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
	const isbn = req.params.isbn;
	const username = req.session.authorization?.username;

	if (!username) {
		return res.status(403).json({ message: "User not logged in" });
	}

	if (!books[isbn]) {
		return res.status(404).json({ message: "Book not found" });
	}

	if (books[isbn].reviews[username]) {
		delete books[isbn].reviews[username];
		return res
			.status(200)
			.json({
				message: `Review for book with ISBN ${isbn} deleted by ${username}`,
			});
	} else {
		return res.status(404).json({ message: "Review not found for this user" });
	}
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
