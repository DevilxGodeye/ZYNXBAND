const awsIot = require("aws-iot-device-sdk");
const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors()); // Allow cross-origin requests
app.use(express.static(__dirname)); // Serve frontend files

const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });

let latestSensorData = {}; // Store the latest sensor data

// Connect to AWS IoT Core
const device = awsIot.device({
  keyPath: path.join(__dirname, "certs/private.pem.key"),
  certPath: path.join(__dirname, "certs/certificate.pem.crt"),
  caPath: path.join(__dirname, "certs/AmazonRootCA1.pem"),
  clientId: "iotclient-0a16bd7-956b-4d49-a055-0a68f67d1e10",
  host: "a1m6qtqn3ap0gc-ats.iot.eu-central-1.amazonaws.com", // Replace with your actual endpoint
});

// AWS IoT Core Connection
device.on("connect", () => {
  console.log("✅ Connected to AWS IoT Core!");
  device.subscribe("fitness/processedData"); // Subscribe to MQTT topic
});

// Listen for incoming sensor data
device.on("message", (topic, payload) => {
  latestSensorData = JSON.parse(payload.toString()); // Store latest data
  console.log("📩 New Data:", latestSensorData);

  // Send data to all connected WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(latestSensorData));
    }
  });
});

// API to get the latest sensor data
app.get("/api/recommendations", (req, res) => {
  if (latestSensorData && latestSensorData.suggestions) {
    res.json({ recommendations: latestSensorData.suggestions });
  } else {
    res.json({ recommendations: [] });
  }
});

// WebSocket Connection for Frontend
wss.on("connection", (ws) => {
  console.log("✅ WebSocket client connected");

  // Send the latest sensor data immediately after connecting
  ws.send(JSON.stringify(latestSensorData));

  ws.on("close", () => console.log("❌ WebSocket client disconnected"));
});

// Handle all other routes by serving index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start Server on Vercel Port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
