const express = require("express");
const app = express();

app.use(express.json());

let students = [
  { id: 1, name: "Harshil", course: "B.Tech AIML" },
  { id: 2, name: "Aman", course: "CSE" },
  { id: 3, name: "Riya", course: "IT" }
];

app.get("/", (req, res) => {
  res.send("Welcome to Express.js API");
});

app.get("/students", (req, res) => {
  res.json(students);
});

app.post("/students", (req, res) => {
  const newStudent = { id: students.length + 1, ...req.body };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.listen(4000, () => {
  console.log("Express server running at http://localhost:4000");
});
