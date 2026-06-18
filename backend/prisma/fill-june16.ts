/**
 * Script pontual: insere leituras de sensores para 17/06/2026 (00h00–23h59) e primeiros 30min de 18/06/2026
 * Uso: npx ts-node --transpile-only prisma/fill-june16.ts
 */
import { PrismaClient, CowStatus } from "@prisma/client";

const prisma = new PrismaClient();

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const DAY_START = new Date("2026-06-17T00:00:00.000Z");

function generateValues(status: CowStatus) {
  let bpm: number, celsius: number;
  let accelX: number, accelY: number, accelZ: number;
  let gyroX: number, gyroY: number, gyroZ: number;

  if (status === CowStatus.HEAT_STRESS) {
    bpm = Math.round(randomBetween(102, 118));
    celsius = parseFloat(randomBetween(39.2, 40.1).toFixed(1));
    accelX = parseFloat(randomBetween(0.9, 1.8).toFixed(3));
    accelY = parseFloat(randomBetween(0.9, 1.8).toFixed(3));
    accelZ = parseFloat(randomBetween(8.5, 10.5).toFixed(3));
    gyroX = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
    gyroY = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
    gyroZ = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
  } else if (status === CowStatus.CALVING) {
    bpm = Math.round(randomBetween(92, 108));
    celsius = parseFloat(randomBetween(38.0, 39.0).toFixed(1));
    accelX = parseFloat(randomBetween(-1.2, 1.2).toFixed(3));
    accelY = parseFloat(randomBetween(-1.2, 1.2).toFixed(3));
    accelZ = parseFloat(randomBetween(0.6, 1.4).toFixed(3));
    gyroX = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
    gyroY = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
    gyroZ = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
  } else if (status === CowStatus.ALERT) {
    bpm = Math.round(randomBetween(90, 110));
    celsius = parseFloat(randomBetween(38.8, 39.6).toFixed(1));
    accelX = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
    accelY = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
    accelZ = parseFloat(randomBetween(8.0, 10.5).toFixed(3));
    gyroX = parseFloat(randomBetween(-0.5, 0.5).toFixed(3));
    gyroY = parseFloat(randomBetween(-0.5, 0.5).toFixed(3));
    gyroZ = parseFloat(randomBetween(-0.5, 0.5).toFixed(3));
  } else {
    bpm = Math.round(randomBetween(58, 82));
    celsius = parseFloat(randomBetween(37.8, 38.8).toFixed(1));
    accelX = parseFloat(randomBetween(-0.6, 0.6).toFixed(3));
    accelY = parseFloat(randomBetween(-0.6, 0.6).toFixed(3));
    accelZ = parseFloat(randomBetween(9.0, 10.0).toFixed(3));
    gyroX = parseFloat(randomBetween(-0.3, 0.3).toFixed(3));
    gyroY = parseFloat(randomBetween(-0.3, 0.3).toFixed(3));
    gyroZ = parseFloat(randomBetween(-0.3, 0.3).toFixed(3));
  }

  return { bpm, celsius, accelX, accelY, accelZ, gyroX, gyroY, gyroZ };
}

// 17/06: leituras horárias 00h00–23h00 + 23h59
// 18/06: 00h00 e 00h30
const timestamps: Date[] = [];
for (let h = 0; h < 24; h++) {
  timestamps.push(new Date(DAY_START.getTime() + h * 3_600_000));
}
timestamps.push(new Date("2026-06-17T23:59:00.000Z"));
timestamps.push(new Date("2026-06-18T00:00:00.000Z"));
timestamps.push(new Date("2026-06-18T00:30:00.000Z"));

async function main() {
  const cows = await prisma.cow.findMany({
    where: { status: { not: CowStatus.RETIRED } },
    select: { id: true, status: true },
  });

  console.log(`Gerando dados para ${cows.length} vacas (17/06 00h00–23h59 + 18/06 00h00–00h30)...`);

  for (const cow of cows) {
    const heartRateRecords = [];
    const temperatureRecords = [];
    const accelerometerRecords = [];

    for (const measuredAt of timestamps) {
      const { bpm, celsius, accelX, accelY, accelZ, gyroX, gyroY, gyroZ } = generateValues(cow.status);
      heartRateRecords.push({ cowId: cow.id, bpm, measuredAt });
      temperatureRecords.push({ cowId: cow.id, celsius, measuredAt });
      accelerometerRecords.push({ cowId: cow.id, accelX, accelY, accelZ, gyroX, gyroY, gyroZ, measuredAt });
    }

    await Promise.all([
      prisma.heartRateData.createMany({ data: heartRateRecords }),
      prisma.temperatureData.createMany({ data: temperatureRecords }),
      prisma.accelerometerData.createMany({ data: accelerometerRecords }),
    ]);
  }

  console.log("Concluído.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
