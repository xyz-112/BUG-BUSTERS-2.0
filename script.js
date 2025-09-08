// Portfolio Projects
const projects = [
  { title: "Weather App", desc: "Weather forecast with maps & geolocation", link: "#" },
  { title: "Chat App", desc: "Real-time chat with Socket.io", link: "#" },
  { title: "Notes App", desc: "Full-stack CRUD with DB", link: "#" }
];

// Render Projects
const projectsDiv = document.getElementById("projects");
projects.forEach(p => {
  const card = document.createElement("div");
  card.className = "p-4 bg-slate-700 rounded-xl shadow hover:scale-105 transition";
  card.innerHTML = `
    <h3 class="text-xl font-bold">${p.title}</h3>
    <p class="mt-2">${p.desc}</p>
    <a href="${p.link}" class="text-blue-400 mt-3 inline-block">View Project →</a>
  `;
  projectsDiv.appendChild(card);
});

// Handle Contact Form
const form = document.getElementById("contactForm");
const status = document.getElementById("status");

form.addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  console.log("Contact form submitted:", data);
  status.classList.remove("hidden");
  form.reset();
});
