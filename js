const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const users = []; // in-memory user store (reset when server restarts)

// ✅ Register API
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ msg: "Missing data" });

  const existingUser = users.find(u => u.username === username);
  if (existingUser) return res.status(400).json({ msg: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.json({ msg: "User registered successfully" });
});

// ✅ Login API
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign({ username }, "secretkey", { expiresIn: "1h" });
  res.json({ token });
});

// ✅ Protected Route Example
app.get("/dashboard", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, "secretkey");
    res.json({ msg: `Welcome ${decoded.username}` });
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
