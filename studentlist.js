// frontend/src/StudentList.js
import { useState, useEffect } from "react";

function StudentList({ onEdit }) {
  const [students, setStudents] = useState([]);

  const fetchStudents = () => {
    fetch("http://localhost:5000/students")
      .then(res => res.json())
      .then(data => setStudents(data));
  };

  useEffect(() => { fetchStudents(); }, []);

  const deleteStudent = (id) => {
    fetch(`http://localhost:5000/students/${id}`, { method: "DELETE" })
      .then(() => fetchStudents());
  };

  return (
    <div>
      <h2>Student Directory</h2>
      <ul>
        {students.map(s => (
          <li key={s.id}>
            {s.name} - {s.age} years
            <button onClick={() => onEdit(s)}>Edit</button>
            <button onClick={() => deleteStudent(s.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentList;
