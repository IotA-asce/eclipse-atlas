export interface MajorCity {
  name: string
  latitude: number
  longitude: number
}

/** A deliberately compact set of recognisable reference cities, bundled with the app. */
export const majorCities: readonly MajorCity[] = [
  { name: 'New York', latitude: 40.7128, longitude: -74.006 },
  { name: 'Mexico City', latitude: 19.4326, longitude: -99.1332 },
  { name: 'São Paulo', latitude: -23.5505, longitude: -46.6333 },
  { name: 'Buenos Aires', latitude: -34.6037, longitude: -58.3816 },
  { name: 'London', latitude: 51.5072, longitude: -0.1276 },
  { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Cairo', latitude: 30.0444, longitude: 31.2357 },
  { name: 'Lagos', latitude: 6.5244, longitude: 3.3792 },
  { name: 'Johannesburg', latitude: -26.2041, longitude: 28.0473 },
  { name: 'Moscow', latitude: 55.7558, longitude: 37.6173 },
  { name: 'Istanbul', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Dubai', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Delhi', latitude: 28.6139, longitude: 77.209 },
  { name: 'Mumbai', latitude: 19.076, longitude: 72.8777 },
  { name: 'Beijing', latitude: 39.9042, longitude: 116.4074 },
  { name: 'Shanghai', latitude: 31.2304, longitude: 121.4737 },
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Seoul', latitude: 37.5665, longitude: 126.978 },
  { name: 'Jakarta', latitude: -6.2088, longitude: 106.8456 },
  { name: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Auckland', latitude: -36.8485, longitude: 174.7633 },
]
