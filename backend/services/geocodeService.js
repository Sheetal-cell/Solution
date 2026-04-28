const fetch = global.fetch || require("node-fetch");

// 🔥 fallback cities (for demo stability)
const fallbackLocations = {
  Delhi: { lat: 28.6139, lon: 77.2090 },
  Kolkata: { lat: 22.5726, lon: 88.3639 },
  Mumbai: { lat: 19.0760, lon: 72.8777 },
  Bengaluru: { lat: 12.9716, lon: 77.5946 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  Hyderabad: { lat: 17.3850, lon: 78.4867 },
};

async function geocodeLocation(place) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      place
    )}&limit=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "navya-routes-app", // ✅ required
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Geocode API error:", text);
      throw new Error("Geocoding API failed");
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      throw new Error("No location found");
    }

    return {
      name: data[0].display_name,
      lat: Number(data[0].lat),
      lon: Number(data[0].lon),
    };
  } catch (err) {
    console.warn(`⚠️ Geocode failed for "${place}", using fallback`);

    // ✅ fallback (CRITICAL for demo)
    if (fallbackLocations[place]) {
      return {
        name: place,
        lat: fallbackLocations[place].lat,
        lon: fallbackLocations[place].lon,
      };
    }

    return null;
  }
}

module.exports = { geocodeLocation };