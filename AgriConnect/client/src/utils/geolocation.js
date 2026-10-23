const REGIONAL_COORDINATES = {
  anand: [22.5645, 72.9289],
  kheda: [22.7533, 72.6841],
  nadiad: [22.6916, 72.8634],
  vadodara: [22.3072, 73.1812],
  baroda: [22.3072, 73.1812],
  rajkot: [22.3039, 70.8022],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  belagavi: [15.8497, 74.4977],
  belgaum: [15.8497, 74.4977],
  mandya: [12.5244, 76.8958],
  mysuru: [12.2958, 76.6394],
  raichur: [16.2076, 77.3463],
  dharwad: [15.4589, 75.0078],
  kolhapur: [16.705, 74.2433],
  pune: [18.5204, 73.8567],
  nagpur: [21.1458, 79.0882],
  ludhiana: [30.901, 75.8573],
  karnal: [29.6857, 76.9905]
};

export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const coordinates = [lat1, lon1, lat2, lon2].map(Number);
  if (!coordinates.every(Number.isFinite)) return null;
  const [latitude1, longitude1, latitude2, longitude2] = coordinates;
  if (
    Math.abs(latitude1) > 90 ||
    Math.abs(latitude2) > 90 ||
    Math.abs(longitude1) > 180 ||
    Math.abs(longitude2) > 180
  ) {
    return null;
  }

  const radians = Math.PI / 180;
  const dLat = (latitude2 - latitude1) * radians;
  const dLon = (longitude2 - longitude1) * radians;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latitude1 * radians) *
      Math.cos(latitude2 * radians) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export function resolveJobCoordinates(job) {
  const latitude = Number(job.latitude);
  const longitude = Number(job.longitude);
  if (
    job.latitude != null &&
    job.longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  ) {
    return { lat: latitude, lng: longitude, approximate: false };
  }

  const location = `${job.location || ''} ${job.district || ''} ${job.village || ''} ${job.state || ''}`.toLowerCase();
  const match = Object.entries(REGIONAL_COORDINATES).find(([place]) =>
    new RegExp(`(^|[^a-z])${place}([^a-z]|$)`).test(location)
  );
  if (!match) return null;

  return { lat: match[1][0], lng: match[1][1], approximate: true };
}
