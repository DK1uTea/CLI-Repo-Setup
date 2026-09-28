const EARTH_RADIUS_METERS = 6_371_000;

/** Khoảng cách giữa 2 toạ độ (lat/lon, độ thập phân) theo công thức Haversine, đơn vị mét */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const clamped = Math.min(1, Math.max(0, a));
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(clamped));
}
