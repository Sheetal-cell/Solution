async function geocodeLocation(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    place
  )}&limit=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "SmartChain-Hackathon-App/1.0",
    },
  });

  if (!res.ok) {
    throw new Error("Geocoding API failed");
  }

  const data = await res.json();

  if (!data.length) return null;

  return {
    name: data[0].display_name,
    lat: Number(data[0].lat),
    lon: Number(data[0].lon),
  };
}

module.exports = { geocodeLocation };