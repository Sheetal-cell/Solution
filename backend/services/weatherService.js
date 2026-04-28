const fetch = global.fetch || require("node-fetch");

async function getWeatherRisk(source, destination) {
  try {
    const midLat = (source.lat + destination.lat) / 2;
    const midLon = (source.lon + destination.lon) / 2;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${midLat}&longitude=${midLon}&current=temperature_2m,precipitation,rain,weather_code,wind_speed_10m`;

    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      console.error("Weather API response error:", text);
      throw new Error("Weather API request failed");
    }

    const data = await res.json();

    if (!data.current) {
      console.error("Weather API invalid response:", data);
      throw new Error("Weather data missing");
    }

    const current = data.current;

    let score = 0;
    const issues = [];

    if ((current.rain || 0) > 2) {
      score += 25;
      issues.push("Heavy rainfall detected on route");
    }

    if ((current.precipitation || 0) > 3) {
      score += 20;
      issues.push("High precipitation may slow transportation");
    }

    if ((current.wind_speed_10m || 0) > 35) {
      score += 20;
      issues.push("Strong wind may affect logistics movement");
    }

    if ((current.weather_code || 0) >= 95) {
      score += 30;
      issues.push("Thunderstorm risk detected");
    }

    return {
      score,
      issues,
      temperature: current.temperature_2m || null,
      rain: current.rain || 0,
      precipitation: current.precipitation || 0,
      windSpeed: current.wind_speed_10m || 0,
      weatherCode: current.weather_code || 0,
    };
  } catch (error) {
    console.error("Weather Service Error:", error.message);

    // ✅ Fallback (CRITICAL)
    return {
      score: 0,
      issues: ["Weather data unavailable"],
      temperature: null,
      rain: 0,
      precipitation: 0,
      windSpeed: 0,
      weatherCode: 0,
    };
  }
}

module.exports = { getWeatherRisk };