const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;
const API_KEY = "YOUR_OPENWEATHER_API_KEY"; // <-- Replace with your OpenWeatherMap API key

app.use(express.static("public"));

app.get("/weather", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "Missing coordinates" });

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

app.listen(PORT, () => console.log(`Weather App running on http://localhost:${PORT}`));
