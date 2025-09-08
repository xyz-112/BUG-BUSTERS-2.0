const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

let todos = [
  { id: 1, task: "Learn Node.js" },
  { id: 2, task: "Practice React" }
];

app.get("/api/todos", (req, res) => {
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  const newTodo = { id: Date.now(), task: req.body.task };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.delete("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(t => t.id !== id);
  res.json({ success: true });
});

const reactApp = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
    <title>To-Do App</title>
  </head>
  <body style="font-family: Arial, sans-serif; padding: 30px;">
    <h1>✅ To-Do App</h1>
    <div id="root"></div>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script crossorigin src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <script type="text/babel">
      const { useState, useEffect } = React;

      function App() {
        const [todos, setTodos] = useState([]);
        const [task, setTask] = useState("");

        useEffect(() => {
          fetch("/api/todos")
            .then(res => res.json())
            .then(setTodos);
        }, []);

        async function addTodo() {
          if (!task) return;
          const res = await fetch("/api/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task })
          });
          const newTodo = await res.json();
          setTodos([...todos, newTodo]);
          setTask("");
        }

        async function deleteTodo(id) {
          await fetch("/api/todos/" + id, { method: "DELETE" });
          setTodos(todos.filter(t => t.id !== id));
        }

        return (
          <div>
            <input
              value={task}
              onChange={e => setTask(e.target.value)}
              placeholder="New Task"
            />
            <button onClick={addTodo}>Add</button>
            <ul>
              {todos.map(t => (
                <li key={t.id}>
                  {t.task}
                  <button onClick={() => deleteTodo(t.id)}>❌</button>
                </li>
              ))}
            </ul>
          </div>
        );
      }

      ReactDOM.createRoot(document.getElementById("root")).render(<App />);
    </script>
  </body>
</html>
`;

app.get("/", (req, res) => {
  res.send(reactApp);
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(\`🚀 To-Do App running at http://localhost:\${PORT}\`)
);
