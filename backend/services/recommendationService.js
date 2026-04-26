const EARTH_RADIUS_KM = 6371;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function inverseDistanceScore(distanceKm) {
  if (!Number.isFinite(distanceKm)) return 0.5;
  return 1 / (1 + distanceKm);
}

export function scoreRestaurant(restaurant, userLocation) {
  const rating = safeNumber(restaurant.rating, 4);
  const popularity = safeNumber(restaurant.popularity, 0);
  const normRating = Math.max(0, Math.min(1, rating / 5));
  const normPopularity = Math.max(0, Math.min(1, popularity / 100));

  let invDistance = 0.5;
  let distanceKm = null;

  if (
    userLocation &&
    Number.isFinite(userLocation.lat) &&
    Number.isFinite(userLocation.lng) &&
    Number.isFinite(restaurant.latitude) &&
    Number.isFinite(restaurant.longitude)
  ) {
    distanceKm = haversineDistanceKm(
      userLocation.lat,
      userLocation.lng,
      restaurant.latitude,
      restaurant.longitude
    );
    invDistance = inverseDistanceScore(distanceKm);
  }

  const score = (0.4 * normRating) + (0.3 * invDistance) + (0.3 * normPopularity);

  return {
    ...restaurant,
    recommendation: {
      score: Number(score.toFixed(4)),
      distanceKm: distanceKm == null ? null : Number(distanceKm.toFixed(2)),
      rating: Number(rating.toFixed(1)),
      popularity: Number(popularity.toFixed(1))
    }
  };
}

export function rankRestaurants(restaurants, userLocation) {
  return restaurants
    .map((restaurant) => scoreRestaurant(restaurant, userLocation))
    .sort((a, b) => b.recommendation.score - a.recommendation.score);
}
