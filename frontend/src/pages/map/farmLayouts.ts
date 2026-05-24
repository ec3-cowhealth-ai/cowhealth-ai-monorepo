export interface CowPin {
  x: number; // percentual 0-100
  y: number;
  label?: string; // "+12", "·", etc
}

export interface Zone {
  points: string; // SVG polygon points ou path "d"
  fill: string;
  stroke: string;
  label: string;
  labelX: number;
  labelY: number;
  tone: "success" | "warn" | "danger" | "neutral";
}

export interface Road {
  d: string;
}

export interface FarmLayout {
  viewBox: string;
  roads: Road[];
  zones: Zone[];
  defaultPins: CowPin[];
}

// Fazenda 0 — Fazenda Aurora (campos amplos, estábulo central)
const aurora: FarmLayout = {
  viewBox: "0 0 390 620",
  roads: [
    { d: "M195 0 L195 620" },
    { d: "M0 310 L390 310" },
  ],
  zones: [
    { points: "30 40 180 30 185 290 30 300", fill: "rgba(51,153,137,0.10)", stroke: "rgba(51,153,137,0.30)", label: "PASTO A", labelX: 105, labelY: 165, tone: "success" },
    { points: "210 30 370 40 370 300 205 290", fill: "rgba(51,153,137,0.10)", stroke: "rgba(51,153,137,0.30)", label: "PASTO B", labelX: 285, labelY: 165, tone: "success" },
    { points: "30 330 180 320 185 490 60 510", fill: "rgba(232,198,107,0.10)", stroke: "rgba(232,198,107,0.35)", label: "PRÉ-PARTO", labelX: 110, labelY: 420, tone: "warn" },
    { points: "210 320 360 330 355 490 215 480", fill: "rgba(51,153,137,0.08)", stroke: "rgba(51,153,137,0.25)", label: "ESTÁBULO A", labelX: 285, labelY: 405, tone: "success" },
    { points: "80 530 310 520 305 590 85 595", fill: "rgba(107,180,232,0.08)", stroke: "rgba(107,180,232,0.25)", label: "BEBEDOURO", labelX: 195, labelY: 558, tone: "neutral" },
  ],
  defaultPins: [
    { x: 25, y: 22 }, { x: 38, y: 35 }, { x: 15, y: 42 },
    { x: 60, y: 18 }, { x: 72, y: 30, label: "+8" },
    { x: 78, y: 20 }, { x: 52, y: 50 }, { x: 30, y: 72 },
  ],
};

// Fazenda 1 — São Bento (terreno irregular, corredor central)
const saoBento: FarmLayout = {
  viewBox: "0 0 390 620",
  roads: [
    { d: "M80 0 Q100 310 80 620" },
    { d: "M0 200 L390 180" },
    { d: "M0 440 L390 460" },
  ],
  zones: [
    { points: "100 20 370 20 365 175 100 190", fill: "rgba(51,153,137,0.10)", stroke: "rgba(51,153,137,0.30)", label: "PIQUETE NORTE", labelX: 235, labelY: 105, tone: "success" },
    { points: "100 205 365 185 360 435 105 450", fill: "rgba(51,153,137,0.08)", stroke: "rgba(51,153,137,0.25)", label: "PIQUETE CENTRAL", labelX: 235, labelY: 320, tone: "success" },
    { points: "100 465 360 455 355 600 105 605", fill: "rgba(232,198,107,0.10)", stroke: "rgba(232,198,107,0.35)", label: "ÁREA PRÉ-PARTO", labelX: 230, labelY: 535, tone: "warn" },
    { points: "10 210 70 200 70 440 10 450", fill: "rgba(51,153,137,0.12)", stroke: "rgba(51,153,137,0.35)", label: "EST.", labelX: 40, labelY: 325, tone: "success" },
  ],
  defaultPins: [
    { x: 35, y: 12 }, { x: 55, y: 18 }, { x: 75, y: 10, label: "+11" },
    { x: 65, y: 38 }, { x: 45, y: 52 }, { x: 80, y: 60, label: "+6" },
    { x: 35, y: 78 }, { x: 60, y: 82 },
  ],
};

// Fazenda 2 — Vale Verde (formato em L, lagoa no canto)
const valeVerde: FarmLayout = {
  viewBox: "0 0 390 620",
  roads: [
    { d: "M0 260 L390 260" },
    { d: "M260 0 L260 260" },
  ],
  zones: [
    { points: "20 20 250 20 250 250 20 250", fill: "rgba(51,153,137,0.10)", stroke: "rgba(51,153,137,0.30)", label: "PASTO PRINCIPAL", labelX: 135, labelY: 135, tone: "success" },
    { points: "275 20 380 20 380 250 275 250", fill: "rgba(107,180,232,0.12)", stroke: "rgba(107,180,232,0.35)", label: "LAGOA", labelX: 328, labelY: 135, tone: "neutral" },
    { points: "20 280 390 280 385 460 20 470", fill: "rgba(51,153,137,0.08)", stroke: "rgba(51,153,137,0.25)", label: "PIQUETE SUL", labelX: 205, labelY: 375, tone: "success" },
    { points: "20 490 200 480 195 600 20 605", fill: "rgba(232,198,107,0.10)", stroke: "rgba(232,198,107,0.35)", label: "PRÉ-PARTO", labelX: 110, labelY: 545, tone: "warn" },
    { points: "220 490 385 480 380 600 215 605", fill: "rgba(232,124,92,0.08)", stroke: "rgba(232,124,92,0.30)", label: "QUARENTENA", labelX: 300, labelY: 545, tone: "danger" },
  ],
  defaultPins: [
    { x: 15, y: 18 }, { x: 28, y: 30 }, { x: 42, y: 20, label: "+9" },
    { x: 20, y: 42 }, { x: 50, y: 52 }, { x: 35, y: 65, label: "+5" },
    { x: 78, y: 72 }, { x: 88, y: 82 },
  ],
};

// Fazenda 3 — Santa Clara (reticulado, irrigação)
const santaClara: FarmLayout = {
  viewBox: "0 0 390 620",
  roads: [
    { d: "M130 0 L130 620" },
    { d: "M260 0 L260 620" },
    { d: "M0 205 L390 205" },
    { d: "M0 415 L390 415" },
  ],
  zones: [
    { points: "10 10 120 10 120 200 10 200", fill: "rgba(51,153,137,0.12)", stroke: "rgba(51,153,137,0.30)", label: "PIQUETE 1", labelX: 65, labelY: 105, tone: "success" },
    { points: "140 10 250 10 250 200 140 200", fill: "rgba(51,153,137,0.10)", stroke: "rgba(51,153,137,0.25)", label: "PIQUETE 2", labelX: 195, labelY: 105, tone: "success" },
    { points: "270 10 380 10 380 200 270 200", fill: "rgba(232,198,107,0.10)", stroke: "rgba(232,198,107,0.30)", label: "PIQUETE 3", labelX: 325, labelY: 105, tone: "warn" },
    { points: "10 220 120 220 120 410 10 410", fill: "rgba(51,153,137,0.08)", stroke: "rgba(51,153,137,0.25)", label: "PIQUETE 4", labelX: 65, labelY: 315, tone: "success" },
    { points: "140 220 250 220 250 410 140 410", fill: "rgba(51,153,137,0.10)", stroke: "rgba(51,153,137,0.25)", label: "ESTÁBULO", labelX: 195, labelY: 315, tone: "success" },
    { points: "270 220 380 220 380 410 270 410", fill: "rgba(107,180,232,0.10)", stroke: "rgba(107,180,232,0.30)", label: "PIQUETE 6", labelX: 325, labelY: 315, tone: "neutral" },
    { points: "10 430 380 430 380 610 10 610", fill: "rgba(232,198,107,0.08)", stroke: "rgba(232,198,107,0.25)", label: "ÁREA DE MANEJO", labelX: 195, labelY: 520, tone: "warn" },
  ],
  defaultPins: [
    { x: 15, y: 18 }, { x: 40, y: 25 }, { x: 52, y: 12 },
    { x: 75, y: 22 }, { x: 82, y: 38, label: "+7" },
    { x: 22, y: 55 }, { x: 48, y: 60 }, { x: 70, y: 75 },
  ],
};

// Fazenda 4 — Rio Bonito (ao longo de um rio, formato linear)
const rioBonito: FarmLayout = {
  viewBox: "0 0 390 620",
  roads: [
    { d: "M0 100 Q195 80 390 100" },
  ],
  zones: [
    { points: "10 120 380 105 375 280 15 295", fill: "rgba(51,153,137,0.10)", stroke: "rgba(51,153,137,0.30)", label: "PASTAGEM ALTA", labelX: 195, labelY: 200, tone: "success" },
    { points: "10 315 170 300 165 500 10 515", fill: "rgba(51,153,137,0.10)", stroke: "rgba(51,153,137,0.25)", label: "PASTO OESTE", labelX: 90, labelY: 410, tone: "success" },
    { points: "195 300 375 295 370 490 190 505", fill: "rgba(232,198,107,0.10)", stroke: "rgba(232,198,107,0.35)", label: "PRÉ-PARTO", labelX: 285, labelY: 400, tone: "warn" },
    { points: "30 530 360 520 355 605 35 610", fill: "rgba(107,180,232,0.12)", stroke: "rgba(107,180,232,0.35)", label: "RIO / BEBEDOURO", labelX: 195, labelY: 568, tone: "neutral" },
    { points: "10 10 380 10 375 90 10 95", fill: "rgba(51,153,137,0.08)", stroke: "rgba(51,153,137,0.20)", label: "MATA CILIAR", labelX: 195, labelY: 52, tone: "neutral" },
  ],
  defaultPins: [
    { x: 20, y: 30 }, { x: 45, y: 22 }, { x: 62, y: 35, label: "+14" },
    { x: 80, y: 28 }, { x: 25, y: 62 }, { x: 42, y: 75 },
    { x: 72, y: 68, label: "+5" }, { x: 58, y: 82 },
  ],
};

export const FARM_LAYOUTS: FarmLayout[] = [aurora, saoBento, valeVerde, santaClara, rioBonito];
