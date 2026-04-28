async function getWeatherRisk(source, destination) {
  const midLat = (source.lat + destination.lat) / 2;
  const midLon = (source.lon + destination.lon) / 2;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${midLat}&longitude=${midLon}&current=temperature_2m,precipitation,rain,weather_code,wind_speed_10m`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Weather API failed");
  }

  const data = await res.json();
  const current = data.current;

  let score = 0;
  const issues = [];

  if (current.rain > 2) {
    score += 25;
    issues.push("Heavy rainfall detected on route");
  }

  if (current.precipitation > 3) {
    score += 20;
    issues.push("High precipitation may slow transportation");
  }

  if (current.wind_speed_10m > 35) {
    score += 20;
    issues.push("Strong wind may affect logistics movement");
  }

  if (current.weather_code >= 95) {
    score += 30;
    issues.push("Thunderstorm risk detected");
  }

  return {
    score,
    issues,
    temperature: current.temperature_2m,
    rain: current.rain,
    precipitation: current.precipitation,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
  };
}

module.exports = { getWeatherRisk };
