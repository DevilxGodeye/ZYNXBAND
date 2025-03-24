// Initialize empty datasets for real-time updates
const chartOptions = {
    responsive: true,
    animation: false,
    scales: {
        x: { title: { display: true, text: 'Time' } },
        y: { title: { display: true, text: 'Value' } }
    }
};

// Create empty datasets
const heartRateData = { labels: [], datasets: [{ label: "Heart Rate", data: [], borderColor: "red", borderWidth: 2 }] };
const temperatureData = { labels: [], datasets: [{ label: "Temperature", data: [], borderColor: "orange", borderWidth: 2 }] };
const speedData = { labels: [], datasets: [{ label: "Speed", data: [], borderColor: "blue", borderWidth: 2 }] };
const caloriesData = { labels: [], datasets: [{ label: "Calories Burned", data: [], borderColor: "green", borderWidth: 2 }] };

// Ensure canvas elements exist before creating charts
function getCanvasElement(id) {
    const canvas = document.getElementById(id);
    if (!canvas) {
        console.error(`❌ Canvas element with ID "${id}" not found!`);
        return null;
    }
    return canvas;
}

// Create charts only if the elements exist
const heartRateChart = getCanvasElement("heartRateChart") ? new Chart(getCanvasElement("heartRateChart"), { type: "line", data: heartRateData, options: chartOptions }) : null;
const temperatureChart = getCanvasElement("temperatureChart") ? new Chart(getCanvasElement("temperatureChart"), { type: "line", data: temperatureData, options: chartOptions }) : null;
const speedChart = getCanvasElement("speedChart") ? new Chart(getCanvasElement("speedChart"), { type: "line", data: speedData, options: chartOptions }) : null;
const caloriesChart = getCanvasElement("caloriesChart") ? new Chart(getCanvasElement("caloriesChart"), { type: "line", data: caloriesData, options: chartOptions }) : null;

// Function to update charts with real-time data
function updateCharts(sensorData) {
    // Send recommendations to recommendations.html
    localStorage.setItem("recommendation", sensorData.recommendation);
    console.log("📊 Updating charts with data:", sensorData);

    const timestamp = new Date().toLocaleTimeString();

    if (heartRateChart) addData(heartRateChart, timestamp, sensorData.heart_rate);
    if (temperatureChart) addData(temperatureChart, timestamp, sensorData.temperature);
    if (speedChart) addData(speedChart, timestamp, sensorData.speed);
    if (caloriesChart) addData(caloriesChart, timestamp, sensorData.calories_burned);
}

// Helper function to add new data to chart
function addData(chart, label, data) {
    if (data === undefined || data === null || isNaN(data)) {
        console.warn(`⚠️ Invalid data received for ${chart.options.plugins.title.text}:`, data);
        return; // Ignore empty or invalid data
    }
    console.warn(
        "⚠️ Invalid data received for",
        chart.options?.plugins?.title?.text || "Unknown Chart",
        ":",
        data
    );
    if (chart.data.labels.length >= 10) { // Keep only last 10 points
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(data);
    chart.update();
}