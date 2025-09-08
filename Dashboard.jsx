import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/dashboard", {
        headers: { Authorization: token }
      })
      .then((res) => setMsg(res.data.msg))
      .catch(() => setMsg("Unauthorized"));
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-xl">
      {msg}
    </div>
  );
}
