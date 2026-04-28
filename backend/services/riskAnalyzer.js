function analyzeRisk({ shipmentId, source, destination, cargo, priority, routeData, weatherRisk }) {
  let riskScore = 20;
  const alerts = [];

  if (priority === "Critical") riskScore += 20;
  if (priority === "High") riskScore += 15;
  if (priority === "Medium") riskScore += 8;

  if (cargo.toLowerCase().includes("medicine")) riskScore += 18;
  if (cargo.toLowerCase().includes("food")) riskScore += 12;
  if (cargo.toLowerCase().includes("electronics")) riskScore += 10;

  if (routeData.durationHours > 30) riskScore += 20;
  else if (routeData.durationHours > 15) riskScore += 12;
  else if (routeData.durationHours > 8) riskScore += 6;

  riskScore += weatherRisk.score;
  riskScore = Math.min(riskScore, 100);

  weatherRisk.issues.forEach((issue) => {
    alerts.push({
      title: "Weather Disruption",
      type: "Weather",
      severity: weatherRisk.score >= 30 ? "High" : "Medium",
      message: issue,
    });
  });

  if (routeData.durationHours > 15) {
    alerts.push({
      title: "Long Route Duration",
      type: "Route",
      severity: "Medium",
      message: "Route duration is high. Shipment may face delay risk.",
    });
  }

  if (priority === "Critical" || priority === "High") {
    alerts.push({
      title: "Priority Shipment",
      type: "Priority",
      severity: "High",
      message: "High-priority shipment requires continuous monitoring.",
    });
  }

  let riskLevel = "Low";
  if (riskScore >= 75) riskLevel = "High";
  else if (riskScore >= 45) riskLevel = "Medium";

  const etaSaved =
    riskLevel === "High" ? "3.5 hours" : riskLevel === "Medium" ? "1.5 hours" : "0.5 hours";

  return {
    riskScore,
    riskLevel,
    reason: `${riskLevel} risk detected for ${source} to ${destination}. Main factors: route duration, cargo priority, and live weather conditions.`,
    alerts,
    recommendation:
      riskLevel === "High"
        ? "Use backup transport planning, monitor weather updates, and notify logistics manager immediately."
        : riskLevel === "Medium"
        ? "Keep shipment under monitoring and prepare alternate delivery schedule."
        : "Route is currently stable. Continue normal shipment tracking.",
    etaSaved,
  };
}

module.exports = { analyzeRisk };
