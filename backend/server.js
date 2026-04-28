require("dotenv").config();
const express = require("express");
const cors = require("cors");
const shipmentRoutes = require("./routes/shipment");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
  "http://localhost:5173",
  process.env.FRONTEND_URL
],
    methods: ["GET", "POST"],
  })
);

app.use(express.json({ limit: "10mb" }));

app.use("/api/shipments", shipmentRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SmartChain Supply Chain Optimization API",
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`✅ SmartChain Backend running on http://localhost:${PORT}`);
});