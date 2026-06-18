/**
 * Script pontual: insere 24h de leituras de sensores para 16/06/2026
 * Uso: npx ts-node --project tsconfig.json prisma/fill-june16.ts
 */
import { PrismaClient, CowStatus } from "@prisma/client";

const prisma = new PrismaClient();

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const DAY_START = new Date("2026-06-17T00:00:00.000Z");
const HOURS = 21; // 00:00 → 20:00
const EXTRA_MINUTES = 40; // leitura extra às 20:40

async function main() {
  const cows = await prisma.cow.findMany({
    where: { status: { not: CowStatus.RETIRED } },
    select: { id: true, status: true },
  });

  console.log(`Gerando dados para ${cows.length} vacas em 17/06/2026 (00h00–20h40)...`);

  for (const cow of cows) {
    const heartRateRecords = [];
    const temperatureRecords = [];
    const accelerometerRecords = [];

    for (let h = 0; h < HOURS; h++) {
      const measuredAt = new Date(DAY_START.getTime() + h * 3_600_000);
      const isAlert = cow.status === CowStatus.HEAT_STRESS || cow.status === CowStatus.ALERT;

      let bpm: number, celsius: number;
      let accelX: number, accelY: number, accelZ: number;
      let gyroX: number, gyroY: number, gyroZ: number;

      if (cow.status === CowStatus.HEAT_STRESS) {
        bpm = Math.round(randomBetween(102, 118));
        celsius = parseFloat(randomBetween(39.2, 40.1).toFixed(1));
        accelX = parseFloat(randomBetween(0.9, 1.8).toFixed(3));
        accelY = parseFloat(randomBetween(0.9, 1.8).toFixed(3));
        accelZ = parseFloat(randomBetween(8.5, 10.5).toFixed(3));
        gyroX = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
        gyroY = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
        gyroZ = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
      } else if (cow.status === CowStatus.CALVING) {
        bpm = Math.round(randomBetween(92, 108));
        celsius = parseFloat(randomBetween(38.0, 39.0).toFixed(1));
        accelX = parseFloat(randomBetween(-1.2, 1.2).toFixed(3));
        accelY = parseFloat(randomBetween(-1.2, 1.2).toFixed(3));
        accelZ = parseFloat(randomBetween(0.6, 1.4).toFixed(3));
        gyroX = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
        gyroY = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
        gyroZ = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
      } else if (cow.status === CowStatus.ALERT) {
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

      heartRateRecords.push({ cowId: cow.id, bpm, measuredAt });
      temperatureRecords.push({ cowId: cow.id, celsius, measuredAt });
      accelerometerRecords.push({ cowId: cow.id, accelX, accelY, accelZ, gyroX, gyroY, gyroZ, measuredAt });
    }

    // Leitura extra às 20:40
    const extraAt = new Date(DAY_START.getTime() + (HOURS * 60 + EXTRA_MINUTES) * 60_000);
    const extraBpm = cow.status === CowStatus.HEAT_STRESS ? Math.round(randomBetween(102, 118))
      : cow.status === CowStatus.CALVING ? Math.round(randomBetween(92, 108))
      : cow.status === CowStatus.ALERT ? Math.round(randomBetween(90, 110))
      : Math.round(randomBetween(58, 82));
    const extraCelsius = cow.status === CowStatus.HEAT_STRESS ? parseFloat(randomBetween(39.2, 40.1).toFixed(1))
      : cow.status === CowStatus.CALVING ? parseFloat(randomBetween(38.0, 39.0).toFixed(1))
      : cow.status === CowStatus.ALERT ? parseFloat(randomBetween(38.8, 39.6).toFixed(1))
      : parseFloat(randomBetween(37.8, 38.8).toFixed(1));
    heartRateRecords.push({ cowId: cow.id, bpm: extraBpm, measuredAt: extraAt });
    temperatureRecords.push({ cowId: cow.id, celsius: extraCelsius, measuredAt: extraAt });
    accelerometerRecords.push({
      cowId: cow.id,
      accelX: parseFloat(randomBetween(-0.6, 0.6).toFixed(3)),
      accelY: parseFloat(randomBetween(-0.6, 0.6).toFixed(3)),
      accelZ: parseFloat(randomBetween(9.0, 10.0).toFixed(3)),
      gyroX: parseFloat(randomBetween(-0.3, 0.3).toFixed(3)),
      gyroY: parseFloat(randomBetween(-0.3, 0.3).toFixed(3)),
      gyroZ: parseFloat(randomBetween(-0.3, 0.3).toFixed(3)),
      measuredAt: extraAt,
    });

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
