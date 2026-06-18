/**
 * Retorna a URL da imagem de uma vaca baseada na raça e no ID (rotação determinística).
 * Fallback: null (usar ícone CowHead)
 */

const BREED_IMAGES: Record<string, string[]> = {
  Holandesa: [
    "/images/cows/holandesa/holan_001.jpg",
    "/images/cows/holandesa/holan_002.jpg",
    "/images/cows/holandesa/holan_003.jpg",
    "/images/cows/holandesa/holan_004.jpg",
    "/images/cows/holandesa/holan_005.jpg",
    "/images/cows/holandesa/holan_006.jpg",
  ],
  Gir: [
    "/images/cows/gir/gir_0002.jpg",
    "/images/cows/gir/gir_003.jpg",
    "/images/cows/gir/gir_004.jpg",
    "/images/cows/gir/gir_005.jpg",
  ],
  Girolando: [
    "/images/cows/girolando/girolando_001.jpg",
    "/images/cows/girolando/girolando_002.jpg",
    "/images/cows/girolando/girolando_003.jpg",
    "/images/cows/girolando/girolando_004.jpg",
  ],
  Jersey: [
    "/images/cows/jersey/jersey_001.jpg",
    "/images/cows/jersey/jersey_002.jpg",
    "/images/cows/jersey/jersey_003.jpg",
    "/images/cows/jersey/jersey_004.jpg",
  ],
};

export function getCowBreedImage(breed: string | undefined | null, cowId: number | string): string | null {
  if (!breed) return null;
  const images = BREED_IMAGES[breed];
  if (!images || images.length === 0) return null;
  const index = Number(cowId) % images.length;
  return images[index];
}
