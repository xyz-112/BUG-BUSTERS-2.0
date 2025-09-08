// frontend/src/StudentForm.js
import { useState, useEffect } from "react";

function StudentForm({ editStudent, onSuccess }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    if(editStudent){
      setName(editStudent.name);
      setAge(editStudent.age);
    }
  }, [editStudent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editStudent ? "PUT" : "POST";
    const url = editStudent
      ? `http://localhost:5000/students/${editStudent.id}`
      : "http://localhost:5000/students";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age: Number(age) })
    })
    .then(res => res.json())
    .then(() => {
      setName(""); setAge("");
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{editStudent ? "Edit Student" : "Add Student"}</h2>
      <input
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        placeholder="Age"
        type="number"
        value={age}
        onChange={e => setAge(e.target.value)}
        required
      />
      <button type="submit">{editStudent ? "Update" : "Add"}</button>
    </form>
  );
}

export default StudentForm;
