// Fallback enquanto a migration de geolocalização (PR feat/farm-geolocation) não for aplicada.
// Quando o backend retornar latitude/longitude em GET /farms, os valores opcionais do tipo Farm
// serão usados e este mapa deixa de ser necessário.
const FARM_COORDS: Record<number, { lat: number; lng: number }> = {
  1: { lat: -23.401850, lng: -51.124920 },
  2: { lat: -19.829420, lng: -47.867680 },
  3: { lat: -16.765300, lng: -49.072400 },
  4: { lat: -20.603800, lng: -48.628600 },
  5: { lat: -15.739500, lng: -56.048200 },
};

// Raio de distribuição das vacas dentro da fazenda (em metros)
const FARM_RADIUS_M = 600;

// Pseudo-aleatório determinístico por seed — mesma vaca, mesma posição em todo render
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export interface CowPosition {
  cowId: number;
  lat: number;
  lng: number;
}

export function simulateCowPositions(
  cows: { id: number }[],
  farmId: number,
  farmLat?: number,
  farmLng?: number,
): CowPosition[] {
  const center =
    farmLat != null && farmLng != null
      ? { lat: farmLat, lng: farmLng }
      : FARM_COORDS[farmId];

  if (!center) return [];

  const latDelta = FARM_RADIUS_M / 111_000;
  const lngDelta = FARM_RADIUS_M / (111_000 * Math.cos((center.lat * Math.PI) / 180));

  return cows.map((cow) => {
    const angle  = seededRandom(cow.id * 2)     * 2 * Math.PI;
    const radius = Math.sqrt(seededRandom(cow.id * 2 + 1)); // sqrt → distribuição uniforme no círculo
    return {
      cowId: cow.id,
      lat:   center.lat + radius * latDelta * Math.sin(angle),
      lng:   center.lng + radius * lngDelta * Math.cos(angle),
    };
  });
}
