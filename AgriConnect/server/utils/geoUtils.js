/**
 * AgriConnect Geospatial Utilities
 * Handles Haversine spherical distance calculations, coordinate validations, and rate-limited geocoding.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Validates latitude is a finite number between -90 and 90 degrees
 */
function isValidLatitude(lat) {
  if (lat === null || lat === undefined || lat === '') return false;
  const num = Number(lat);
  return !isNaN(num) && isFinite(num) && num >= -90 && num <= 90;
}

/**
 * Validates longitude is a finite number between -180 and 180 degrees
 */
function isValidLongitude(lng) {
  if (lng === null || lng === undefined || lng === '') return false;
  const num = Number(lng);
  return !isNaN(num) && isFinite(num) && num >= -180 && num <= 180;
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates great-circle distance between two points on a sphere using the Haversine formula.
 * Returns distance in kilometers rounded to 1 decimal place, or null if coordinates are missing/invalid.
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    !isValidLatitude(lat1) ||
    !isValidLongitude(lon1) ||
    !isValidLatitude(lat2) ||
    !isValidLongitude(lon2)
  ) {
    return null;
  }

  const p1Lat = Number(lat1);
  const p1Lon = Number(lon1);
  const p2Lat = Number(lat2);
  const p2Lon = Number(lon2);

  // Exact match optimization
  if (p1Lat === p2Lat && p1Lon === p2Lon) {
    return 0;
  }

  const dLat = toRadians(p2Lat - p1Lat);
  const dLon = toRadians(p2Lon - p1Lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(p1Lat)) *
      Math.cos(toRadians(p2Lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  if (isNaN(distance) || !isFinite(distance)) {
    return null;
  }

  return Math.round(distance * 10) / 10;
}

// In-memory cache for geocoding queries (query -> { timestamp, data })
const geocodeCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Geocodes an address or location query string via OpenStreetMap Nominatim.
 * Strictly respects usage policies, adds required User-Agent, and provides graceful fallback.
 */
async function geocodeLocation(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return [];
  }

  const cleanQuery = query.trim().toLowerCase();
  const cached = geocodeCache.get(cleanQuery);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim()
    )}&addressdetails=1&limit=5&countrycodes=in`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AgriConnect-Platform/1.0 (agricultural-labor-marketplace)',
        Accept: 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Nominatim geocoding warning: HTTP ${response.status}`);
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    const formatted = data.map(item => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      village: item.address?.village || item.address?.suburb || item.address?.town || '',
      district: item.address?.state_district || item.address?.county || '',
      state: item.address?.state || '',
      country: item.address?.country || 'India'
    }));

    geocodeCache.set(cleanQuery, { timestamp: Date.now(), data: formatted });
    return formatted;
  } catch (err) {
    console.warn('Geocoding request failed or timed out:', err.message);
    return [];
  }
}

module.exports = {
  isValidLatitude,
  isValidLongitude,
  calculateHaversineDistance,
  geocodeLocation
};
