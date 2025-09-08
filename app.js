// app.js
const express = require("express");
const app = express();
const port = 5000;

// Middleware to parse JSON body
app.use(express.json());

// Sample student data
let students = [
  { id: 1, name: "Alice", age: 20 },
  { id: 2, name: "Bob", age: 22 },
  { id: 3, name: "Charlie", age: 21 },
];

// Serve static HTML with JS
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Student Directory</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        h1 { color: #333; }
        ul { list-style-type: none; padding: 0; }
        li { margin: 5px 0; }
        input, button { padding: 5px; margin: 5px 0; }
      </style>
    </head>
    <body>
      <h1>My Student Directory</h1>
      <ul id="student-list"></ul>

      <h2>Add Student</h2>
      <input type="text" id="name" placeholder="Name" />
      <input type="number" id="age" placeholder="Age" />
      <button onclick="addStudent()">Add</button>

      <script>
        // Fetch and display students
        function fetchStudents() {
          fetch("/students")
            .then(res => res.json())
            .then(data => {
              const ul = document.getElementById("student-list");
              ul.innerHTML = "";
              data.forEach(student => {
                const li = document.createElement("li");
                li.textContent = student.name + " - " + student.age + " years";
                ul.appendChild(li);
              });
            })
            .catch(err => console.error(err));
        }

        // Add new student
        function addStudent() {
          const name = document.getElementById("name").value;
          const age = parseInt(document.getElementById("age").value);

          if(!name || !age) {
            alert("Please enter name and age");
            return;
          }

          fetch("/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, age })
          })
          .then(res => res.json())
          .then(data => {
            fetchStudents(); // Refresh list
            document.getElementById("name").value = "";
            document.getElementById("age").value = "";
          })
          .catch(err => console.error(err));
        }

        // Initial fetch
        fetchStudents();
      </script>
    </body>
    </html>
  `);
});

// API endpoint: Get students
app.get("/students", (req, res) => {
  res.json(students);
});

// API endpoint: Add student
app.post("/students", (req, res) => {
  const { name, age } = req.body;
  const id = students.length ? students[students.length - 1].id + 1 : 1;
  const newStudent = { id, name, age };
  students.push(newStudent);
  res.json(newStudent);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
