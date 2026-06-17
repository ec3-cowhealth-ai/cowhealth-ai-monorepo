// Fallback enquanto a migration de geolocalização (PR feat/farm-geolocation) não for aplicada.
// Quando o backend retornar latitude/longitude em GET /farms, os valores opcionais do tipo Farm
// serão usados e este mapa deixa de ser necessário.
const FARM_COORDS: Record<number, { lat: number; lng: number }> = {
  1: { lat: -24.6953, lng: -50.7126 }, // Fazenda Aurora
  2: { lat: -24.8373, lng: -49.9234 }, // Fazenda Sao Bento
  3: { lat: -24.9638, lng: -50.0298 }, // Fazenda Santa Clara
  4: { lat: -23.6800, lng: -52.2500 }, // Fazenda Boa Esperanca
  5: { lat: -24.9578, lng: -53.4554 }, // Fazenda Vale Verde
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
    farmLat != null && farmLng != null ? { lat: farmLat, lng: farmLng } : FARM_COORDS[farmId];

  if (!center) return [];

  const latDelta = FARM_RADIUS_M / 111_000;
  const lngDelta = FARM_RADIUS_M / (111_000 * Math.cos((center.lat * Math.PI) / 180));

  return cows.map((cow) => {
    const angle = seededRandom(cow.id * 2) * 2 * Math.PI;
    const radius = Math.sqrt(seededRandom(cow.id * 2 + 1)); // sqrt → distribuição uniforme no círculo
    return {
      cowId: cow.id,
      lat: center.lat + radius * latDelta * Math.sin(angle),
      lng: center.lng + radius * lngDelta * Math.cos(angle),
    };
  });
}
