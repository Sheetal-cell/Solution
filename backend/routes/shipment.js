const express = require("express");
const { geocodeLocation } = require("../services/geocodeService");
const { getRoute } = require("../services/routeService");
const { getWeatherRisk } = require("../services/weatherService");
const { analyzeWithAI } = require("../services/aiService");

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { shipmentId, source, destination, cargo, priority } = req.body;

    if (!shipmentId || !source || !destination || !cargo || !priority) {
      return res.status(400).json({
        message:
          "shipmentId, source, destination, cargo, and priority are required.",
      });
    }

    const sourceGeo = await geocodeLocation(source);
    const destinationGeo = await geocodeLocation(destination);

    if (!sourceGeo || !destinationGeo) {
      return res.status(404).json({
        message: "Could not find source or destination location.",
      });
    }

    const currentRouteData = await getRoute(sourceGeo, destinationGeo);
    const weatherRisk = await getWeatherRisk(sourceGeo, destinationGeo);

    const analysis = await analyzeWithAI({
      shipmentId,
      source,
      destination,
      cargo,
      priority,
      distanceKm: currentRouteData.distanceKm,
      durationHours: currentRouteData.durationHours,
      weather: weatherRisk,
    });

    return res.json({
      shipmentId,
      source,
      destination,
      cargo,
      priority,

      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      reason: analysis.reason,

      currentRoute: currentRouteData.coordinates,
      optimizedRoute: currentRouteData.coordinates,

      alerts: analysis.alerts || [],
      recommendation: analysis.recommendation,
      etaSaved: analysis.etaSaved,

      routeInfo: {
        distanceKm: currentRouteData.distanceKm,
        durationHours: currentRouteData.durationHours,
      },

      weather: weatherRisk,
    });
  } catch (error) {
    console.error("Shipment analysis error:", error);

    return res.status(500).json({
      message: error.message || "Failed to analyze shipment.",
    });
  }
});

module.exports = router;