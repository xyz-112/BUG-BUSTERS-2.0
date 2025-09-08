const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = new Map(); // socket.id -> username
let posts = []; // {id, user, text, likes, comments:[{user,text}]}

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    const name = username?.trim() || "Guest";
    users.set(socket.id, name);
    socket.emit("init", { posts, me: name });
    io.emit("system", `${name} joined`);
  });

  socket.on("post", (text) => {
    const user = users.get(socket.id);
    if (!user || !text.trim()) return;
    const post = {
      id: Date.now(),
      user,
      text: text.trim().slice(0, 300),
      likes: [],
      comments: []
    };
    posts.unshift(post);
    io.emit("update", posts);
  });

  socket.on("like", (id) => {
    const user = users.get(socket.id);
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    if (post.likes.includes(user)) {
      post.likes = post.likes.filter((u) => u !== user);
    } else {
      post.likes.push(user);
    }
    io.emit("update", posts);
  });

  socket.on("comment", ({ id, text }) => {
    const user = users.get(socket.id);
    const post = posts.find((p) => p.id === id);
    if (!user || !post || !text.trim()) return;
    post.comments.push({ user, text: text.trim().slice(0, 200) });
    io.emit("update", posts);
  });

  socket.on("disconnect", () => {
    const name = users.get(socket.id);
    if (name) {
      users.delete(socket.id);
      io.emit("system", `${name} left`);
    }
  });
});

const page = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Social Media Dashboard</title>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body{margin:0;font-family:sans-serif;background:#0b0f14;color:#eee;}
    header{padding:16px;background:#111827;display:flex;gap:10px;}
    input,button{padding:8px;border-radius:6px;border:none;}
    button{background:#2563eb;color:white;cursor:pointer;}
    #feed{padding:16px;display:flex;flex-direction:column;gap:12px;}
    .post{background:#1e293b;padding:12px;border-radius:8px;}
    .meta{font-size:.9rem;opacity:.8;margin-bottom:6px;}
    .comments{margin-top:8px;padding-left:10px;border-left:2px solid #334155;}
    .comment{font-size:.9rem;margin:4px 0;}
  </style>
</head>
<body>
  <header>
    <input id="name" placeholder="Enter your name"/>
    <input id="text" placeholder="What's on your mind?" style="flex:1"/>
    <button onclick="post()">Post</button>
  </header>
  <div id="feed"></div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket=io();
    let me="";
    const feed=document.getElementById("feed");

    socket.on("init", d=>{me=d.me; render(d.posts);});
    socket.on("update", render);
    socket.on("system", msg=>{
      const div=document.createElement("div");
      div.textContent=msg;
      div.style="opacity:.6;text-align:center;margin:6px;";
      feed.prepend(div);
    });

    function join(){
      const name=document.getElementById("name").value.trim()||"Guest";
      socket.emit("join",name);
      document.getElementById("name").disabled=true;
    }
    document.getElementById("name").addEventListener("change",join);

    function post(){
      const t=document.getElementById("text").value.trim();
      if(!t) return;
      socket.emit("post",t);
      document.getElementById("text").value="";
    }

    function like(id){ socket.emit("like",id); }
    function comment(id){
      const text=prompt("Write a comment:");
      if(text) socket.emit("comment",{id,text});
    }

    function render(posts){
      feed.innerHTML="";
      posts.forEach(p=>{
        const div=document.createElement("div");
        div.className="post";
        div.innerHTML=\`
          <div class="meta">\${p.user}</div>
          <div>\${p.text}</div>
          <div>
            <button onclick="like(\${p.id})">❤️ \${p.likes.length}</button>
            <button onclick="comment(\${p.id})">💬 \${p.comments.length}</button>
          </div>
          <div class="comments">\${p.comments.map(c=>'<div class="comment"><b>'+c.user+':</b> '+c.text+'</div>').join("")}</div>
        \`;
        feed.appendChild(div);
      });
    }
  </script>
</body>
</html>
`;

app.get("/",(_,res)=>res.send(page));

server.listen(3000,()=>console.log("Social Media Dashboard running at http://localhost:3000"));
