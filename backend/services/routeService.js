async function getRoute(source, destination) {
  const url = `https://router.project-osrm.org/route/v1/driving/${source.lon},${source.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Route API failed");
  }

  const data = await res.json();

  if (!data.routes || !data.routes.length) {
    throw new Error("No route found");
  }

  const route = data.routes[0];

  const simplified = route.geometry.coordinates.filter((_, index) => index % 15 === 0);

  const coordinates = simplified.map(([lon, lat]) => [lat, lon]);

  return {
    coordinates,
    distanceKm: Number((route.distance / 1000).toFixed(2)),
    durationHours: Number((route.duration / 3600).toFixed(2)),
  };
}

module.exports = { getRoute };