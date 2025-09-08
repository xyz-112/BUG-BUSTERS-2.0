const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = new Map(); // socket.id -> username

function broadcastUserList() {
  io.emit("userlist", Array.from(users.values()));
}

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    const name = String(username || "Guest").trim().slice(0, 20) || "Guest";
    users.set(socket.id, name);
    socket.emit("joined", { me: name });
    io.emit("system", `${name} joined`);
    broadcastUserList();
  });

  socket.on("chat", (msg) => {
    const from = users.get(socket.id);
    if (!from || !msg?.trim()) return;
    io.emit("chat", {
      from,
      text: msg.trim().slice(0, 500),
      ts: Date.now(),
    });
  });

  socket.on("typing", (state) => {
    const from = users.get(socket.id);
    if (!from) return;
    socket.broadcast.emit("typing", { from, state: !!state });
  });

  socket.on("disconnect", () => {
    const name = users.get(socket.id);
    if (name) {
      users.delete(socket.id);
      io.emit("system", `${name} left`);
      broadcastUserList();
    }
  });
});

const page = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Realtime Chat</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background:#0b0f14; color:#e6e6e6; }
    .wrap { display:grid; grid-template-columns: 260px 1fr; height: 100vh; }
    aside { border-right:1px solid #1e293b; padding:16px; background:#0d1320; }
    main { display:flex; flex-direction:column; height:100vh; }
    header { padding:12px 16px; border-bottom:1px solid #1e293b; display:flex; gap:8px; align-items:center;}
    #status { margin-left:auto; opacity:.8; font-size:.9rem; }
    #users { list-style:none; margin:8px 0 0; padding:0; display:flex; flex-direction:column; gap:8px; }
    #users li { padding:8px 10px; border:1px solid #1f2937; border-radius:10px; background:#0f172a; }
    #chat { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
    .msg { max-width: 70%; padding:10px 12px; border-radius:14px; background:#111827; border:1px solid #1f2937; }
    .me { align-self:flex-end; background:#1d4ed8; border-color:#1d4ed8; color:white; }
    .sys { align-self:center; font-size:.9rem; opacity:.8; }
    footer { display:flex; gap:8px; padding:12px; border-top:1px solid #1e293b; }
    input, button { border:1px solid #1f2937; background:#0f172a; color:#e6e6e6; padding:10px 12px; border-radius:10px; }
    input:focus { outline:none; border-color:#3b82f6; }
    button { background:#2563eb; border-color:#2563eb; cursor:pointer; }
    #typing { height:18px; margin:4px 16px; font-size:.9rem; opacity:.8; }
  </style>
</head>
<body>
  <div class="wrap">
    <aside>
      <h3>Online</h3>
      <ul id="users"></ul>
    </aside>
    <main>
      <header>
        <strong>Realtime Chat</strong>
        <span id="status">connecting…</span>
      </header>
      <div id="chat"></div>
      <div id="typing"></div>
      <footer>
        <input id="name" placeholder="Your name" style="width: 200px" />
        <input id="input" placeholder="Type a message" style="flex:1" />
        <button id="send">Send</button>
      </footer>
    </main>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();
    const $ = (s)=>document.querySelector(s);
    const usersEl = $("#users");
    const chatEl = $("#chat");
    const statusEl = $("#status");
    const typingEl = $("#typing");
    const nameEl = $("#name");
    const inputEl = $("#input");
    const sendBtn = $("#send");
    let myName = "";

    function fmt(ts){
      const d=new Date(ts); 
      return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    }
    function addMsg({from,text,ts},me=false){
      const div=document.createElement("div");
      div.className="msg"+(me?" me":"");
      div.innerHTML = "<small style='opacity:.8'>"+from+" • "+fmt(ts)+"</small><br>"+text.replace(/</g,"&lt;");
      chatEl.appendChild(div);
      chatEl.scrollTop=chatEl.scrollHeight;
    }

    socket.on("connect", ()=>{ statusEl.textContent="online"; });

    sendBtn.onclick = () => {
      const name = nameEl.value.trim() || "Guest";
      if (!myName) socket.emit("join", name);
      myName = name;
      const text = inputEl.value.trim();
      if (!text) return;
      socket.emit("chat", text);
      addMsg({from: myName, text, ts: Date.now()}, true);
      inputEl.value="";
      socket.emit("typing", false);
    };

    inputEl.addEventListener("input", ()=>{
      socket.emit("typing", inputEl.value.trim().length>0);
    });

    socket.on("joined", ({me}) => { myName = me; });

    socket.on("chat", (m)=> addMsg(m) );

    socket.on("system", (t)=>{
      const div=document.createElement("div");
      div.className="sys";
      div.textContent=t;
      chatEl.appendChild(div);
      chatEl.scrollTop=chatEl.scrollHeight;
    });

    socket.on("userlist",(list)=>{
      usersEl.innerHTML="";
      list.forEach(u=>{
        const li=document.createElement("li");
        li.textContent=u;
        usersEl.appendChild(li);
      });
    });

    let typingTimer;
    socket.on("typing", ({from,state})=>{
      if(state){
        typingEl.textContent = from + " is typing…";
        clearTimeout(typingTimer);
        typingTimer = setTimeout(()=> typingEl.textContent="", 2000);
      } else {
        typingEl.textContent="";
      }
    });

    socket.on("disconnect", ()=>{ statusEl.textContent="offline"; });
  </script>
</body>
</html>
`;

app.get("/", (_, res) => res.send(page));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Chat server on http://localhost:${PORT}`));
