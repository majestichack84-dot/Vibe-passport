export interface GeocodeResult {
  locationName: string;
}

/**
 * Reverse-geocodes coordinates into a human-readable "City, Country" string.
 * Uses BigDataCloud's free client-side reverse geocode endpoint — no API key,
 * CORS-enabled, fine for demo/low-volume use. Swap for Google/Mapbox geocoding
 * if you need higher accuracy or volume in production.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Reverse geocoding failed");

  const data = await res.json();

  const city: string | undefined =
    data.city || data.locality || data.principalSubdivision;
  const country: string | undefined = data.countryName;

  if (city && country) return `${city}, ${country}`;
  if (country) return country;
  return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
}
