import { prisma } from "./src/lib/prisma";

async function inspectAlerts() {
  const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);

  console.log("\n📊 === INSPEÇÃO DE ALERTAS (últimos 20 min) === \n");

  // 1. Notificações recentes
  const notifications = await prisma.notification.findMany({
    where: {
      createdAt: { gte: twentyMinutesAgo },
    },
    include: {
      cow: {
        select: { id: true, tag: true, name: true, status: true, farm: { select: { name: true } } },
      },
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`🔔 Total de notificações (últimos 20 min): ${notifications.length}\n`);

  if (notifications.length > 0) {
    console.log("📋 Detalhes das notificações:");
    notifications.forEach((n, i) => {
      console.log(`\n  ${i + 1}. ${n.title}`);
      console.log(`     Vaca: ${n.cow?.name || n.cow?.tag} (ID: ${n.cow?.id})`);
      console.log(`     Fazenda: ${n.cow?.farm?.name}`);
      console.log(`     Status atual: ${n.cow?.status}`);
      console.log(`     Mensagem: ${n.message}`);
      console.log(`     Para: ${n.user?.email}`);
      console.log(`     Criada em: ${n.createdAt.toLocaleString("pt-BR")}`);
      console.log(`     Lida: ${n.readAt ? "Sim" : "Não"}`);
    });
  }

  // 2. Vacas que mudaram de status
  const statusChanges = await prisma.cow.findMany({
    where: {
      updatedAt: { gte: twentyMinutesAgo },
      NOT: { status: "HEALTHY" },
    },
    select: {
      id: true,
      tag: true,
      name: true,
      status: true,
      farm: { select: { name: true } },
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  console.log(`\n\n🐄 Vacas com status alterado (últimos 20 min): ${statusChanges.length}\n`);
  if (statusChanges.length > 0) {
    console.log("📋 Vacas em alerta:");
    statusChanges.forEach((cow, i) => {
      console.log(`\n  ${i + 1}. ${cow.name || cow.tag} (ID: ${cow.id})`);
      console.log(`     Status: ${cow.status}`);
      console.log(`     Fazenda: ${cow.farm?.name}`);
      console.log(`     Última atualização: ${cow.updatedAt.toLocaleString("pt-BR")}`);
    });
  }

  // 3. Últimos dados de sensores por vaca em alerta
  if (statusChanges.length > 0) {
    console.log(`\n\n📈 Últimos dados de sensores:\n`);

    for (const cow of statusChanges.slice(0, 3)) {
      console.log(`\n🐄 ${cow.name || cow.tag}:`);

      const [lastHR, lastTemp, lastAccel] = await Promise.all([
        prisma.heartRateData.findFirst({
          where: { cowId: cow.id },
          orderBy: { measuredAt: "desc" },
        }),
        prisma.temperatureData.findFirst({
          where: { cowId: cow.id },
          orderBy: { measuredAt: "desc" },
        }),
        prisma.accelerometerData.findFirst({
          where: { cowId: cow.id },
          orderBy: { measuredAt: "desc" },
        }),
      ]);

      if (lastHR) console.log(`   ❤️  HR: ${lastHR.bpm} bpm (${lastHR.measuredAt.toLocaleString("pt-BR")})`);
      if (lastTemp) console.log(`   🌡️  Temp: ${lastTemp.celsius}°C (${lastTemp.measuredAt.toLocaleString("pt-BR")})`);
      if (lastAccel) {
        console.log(`   📊 Aceleração: X=${lastAccel.accelX}, Y=${lastAccel.accelY}, Z=${lastAccel.accelZ}`);
        console.log(`      Giroscópio: X=${lastAccel.gyroX}, Y=${lastAccel.gyroY}, Z=${lastAccel.gyroZ}`);
      }
    }
  }

  // 4. Estatísticas gerais
  const totalHeartRateRecords = await prisma.heartRateData.count({
    where: { measuredAt: { gte: twentyMinutesAgo } },
  });
  const totalTempRecords = await prisma.temperatureData.count({
    where: { measuredAt: { gte: twentyMinutesAgo } },
  });
  const totalAccelRecords = await prisma.accelerometerData.count({
    where: { measuredAt: { gte: twentyMinutesAgo } },
  });

  console.log(`\n\n📊 Estatísticas (últimos 20 min):`);
  console.log(`   ❤️  Registros de FC: ${totalHeartRateRecords}`);
  console.log(`   🌡️  Registros de Temp: ${totalTempRecords}`);
  console.log(`   📊 Registros de Aceleração: ${totalAccelRecords}`);
  console.log(`   📝 Total de dados: ${totalHeartRateRecords + totalTempRecords + totalAccelRecords}`);

  // 5. Distribuição de status
  const statusDistribution = await prisma.cow.groupBy({
    by: ["status"],
    _count: true,
  });

  console.log(`\n\n🎯 Distribuição de status atual:`);
  statusDistribution.forEach((group) => {
    console.log(`   ${group.status}: ${group._count} vacas`);
  });

  console.log("\n");
  await prisma.$disconnect();
}

inspectAlerts().catch((e) => {
  console.error("Erro:", e);
  process.exit(1);
});
