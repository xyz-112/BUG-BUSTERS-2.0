// frontend/src/App.js
import { useState } from "react";
import StudentList from "./StudentList";
import StudentForm from "./StudentForm";

function App() {
  const [editStudent, setEditStudent] = useState(null);
  const [refresh, setRefresh] = useState(false);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Full Stack Student CRUD</h1>
      <StudentForm
        editStudent={editStudent}
        onSuccess={() => { setEditStudent(null); setRefresh(!refresh); }}
      />
      <StudentList
        key={refresh} // refresh list after add/update/delete
        onEdit={setEditStudent}
      />
    </div>
  );
}

export default App;
