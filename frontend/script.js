document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
      loginForm.addEventListener("submit", function (event) {
          event.preventDefault();

          const username = document.getElementById("username").value;
          const password = document.getElementById("password").value;

          if (username === "admin" && password === "password123") { 
              localStorage.setItem("loggedIn", "true"); 
              window.location.href = "index.html"; 
          } else {
              document.getElementById("error-message").innerText = "Invalid login!";
          }
      });
  }

  // Protect dashboard
  if (window.location.pathname.includes("index.html")) {
      if (localStorage.getItem("loggedIn") !== "true") {
          window.location.href = "login.html";
      }
  }
});

const socket = new WebSocket("ws://localhost:5000");

// When WebSocket connects successfully
socket.onopen = function () {
  console.log("✅ Connected to WebSocket server");
};

// When WebSocket receives new data from backend
socket.onmessage = function (event) {
  const data = JSON.parse(event.data);
  console.log("📩 Live Data:", data);

  // Update dashboard metrics
  document.getElementById("heartRate").innerText = data.heart_rate_bpm;
  document.getElementById("temperature").innerText = data.temperature_celsius;
  document.getElementById("speed").innerText = data.speed_kmh;
  document.getElementById("calories").innerText = data.calories_burned_kcal;
 

  // Update charts with new data
  updateCharts({
    heart_rate: data.heart_rate_bpm,
    temperature: data.temperature_celsius,
    speed: data.speed_kmh,
    calories_burned: data.calories_burned_kcal
  });
  fetchRecommendations();

  // Update recommendations if data contains suggestions
  if (data.suggestions && data.suggestions.length > 0) {
      displayRecommendations(data.suggestions);
  }
};

// Function to fetch recommendations (for when loading `recommendations.html`)
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("recommendations-list")) {
    fetchRecommendations();
  }
});

function fetchRecommendations() {
  fetch("http://127.0.0.1:5000/api/recommendations")  // Correct API endpoint
    .then(response => response.json())
    .then(data => {
      if (data.recommendations && data.recommendations.length > 0) {
        displayRecommendations(data.recommendations);
      } else {
        document.getElementById("recommendations-list").innerHTML = "<li>No recommendations available.</li>";
      }
    })
    .catch(error => console.error("Error fetching recommendations:", error));
}

function displayRecommendations(recommendations) {
  const list = document.getElementById("recommendations-list");
  if (!list) return; // Prevent errors if not on recommendations page

  list.innerHTML = ""; // Clear old data

  recommendations.forEach(suggestion => {
      let listItem = document.createElement("li");
      listItem.textContent = suggestion;
      list.appendChild(listItem);
  });
}

// Handle WebSocket errors
socket.onerror = function (error) {
  console.error("❌ WebSocket Error:", error);
};

// Handle WebSocket disconnection
socket.onclose = function () {
  console.log("❌ WebSocket Disconnected");
};