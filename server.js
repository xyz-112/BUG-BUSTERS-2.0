// backend/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

app.use(cors());
app.use(bodyParser.json());

let students = [
  { id: 1, name: "Alice", age: 20 },
  { id: 2, name: "Bob", age: 22 },
  { id: 3, name: "Charlie", age: 21 },
];

// GET all students
app.get("/students", (req, res) => res.json(students));

// GET single student
app.get("/students/:id", (req, res) => {
  const student = students.find(s => s.id == req.params.id);
  student ? res.json(student) : res.status(404).json({ message: "Not found" });
});

// POST (Create)
app.post("/students", (req, res) => {
  const newStudent = { id: Date.now(), ...req.body };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

// PUT (Update)
app.put("/students/:id", (req, res) => {
  const index = students.findIndex(s => s.id == req.params.id);
  if(index !== -1){
    students[index] = { ...students[index], ...req.body };
    res.json(students[index]);
  } else res.status(404).json({ message: "Not found" });
});

// DELETE
app.delete("/students/:id", (req, res) => {
  const index = students.findIndex(s => s.id == req.params.id);
  if(index !== -1){
    const deleted = students.splice(index, 1);
    res.json(deleted[0]);
  } else res.status(404).json({ message: "Not found" });
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
