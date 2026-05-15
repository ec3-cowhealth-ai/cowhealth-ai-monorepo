import { PrismaClient, CowStatus, CollarStatus, DataFrequency, UserProfile } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ========== HELPERS ==========

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomElement = <T,>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const dateHoursAgo = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

const generateCNPJ = () => {
  const numbers = Array.from({ length: 12 }, () => randomInt(0, 9)).join("");
  const checkDigit = randomInt(0, 9);
  return `${numbers.slice(0, 8)}/${numbers.slice(8)}${checkDigit}`;
};

const generateCollarName = (index: number) =>
  `collar-${String(index + 1).padStart(3, "0")}`;

const generateCowTag = (index: number) =>
  `BR-${String(index + 1).padStart(4, "0")}`;

const generateCowName = () => {
  const firstNames = [
    "Mimosa", "Bonita", "Estrela", "Clarinha", "Morena", "Dolly", "Luna", "Bella",
    "Joia", "Rainha", "Branca", "Preta", "Malhada", "Marrom", "Vermelha", "Rosa",
    "Flor", "Vento", "Chuva", "Sol", "Noite", "Madrugada", "Amanhecer", "Entardecer",
    "Brisa", "Nuvem", "Montanha", "Rio", "Bosque", "Prado", "Colina", "Vale",
  ];
  return randomElement(firstNames);
};

const generateBreed = () => {
  const breeds = [
    "Nelore", "Gir", "Holandesa", "Angus", "Braford", "Tabapuã", "Caracu",
    "Simmental", "Charolês", "Santa Gertrudis", "Simbra", "Guzerá", "Indubrasil",
  ];
  return randomElement(breeds);
};

const generateCityState = () => {
  const locations = [
    { city: "Curitiba", state: "PR" },
    { city: "Londrina", state: "PR" },
    { city: "Maringá", state: "PR" },
    { city: "Belo Horizonte", state: "MG" },
    { city: "Uberaba", state: "MG" },
    { city: "Goiânia", state: "GO" },
    { city: "Anápolis", state: "GO" },
    { city: "Ribeirão Preto", state: "SP" },
    { city: "Barretos", state: "SP" },
    { city: "Araçatuba", state: "SP" },
  ];
  return randomElement(locations);
};

const generateSensorReadings = (
  cowId: number,
  totalHours: number,
  scenario: string
) => {
  const heartRateRecords = [];
  const temperatureRecords = [];
  const accelerometerRecords = [];

  for (let hoursAgo = totalHours; hoursAgo >= 0; hoursAgo--) {
    const measuredAt = dateHoursAgo(hoursAgo);
    const isRecentAlert = hoursAgo <= 6;

    let bpm: number;
    let celsius: number;
    let accelX: number, accelY: number, accelZ: number;
    let gyroX: number, gyroY: number, gyroZ: number;

    if (scenario === "heat_stress" && isRecentAlert) {
      bpm = Math.round(randomBetween(102, 118));
      celsius = parseFloat(randomBetween(39.2, 40.1).toFixed(1));
      accelX = parseFloat(randomBetween(0.9, 1.8).toFixed(3));
      accelY = parseFloat(randomBetween(0.9, 1.8).toFixed(3));
      accelZ = parseFloat(randomBetween(8.5, 10.5).toFixed(3));
      gyroX = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
      gyroY = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
      gyroZ = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
    } else if (scenario === "calving" && isRecentAlert) {
      const tempBase = 38.8 - (hoursAgo * 0.05);
      bpm = Math.round(randomBetween(92, 108));
      celsius = parseFloat(Math.min(Math.max(tempBase + randomBetween(-0.2, 0.2), 37.5), 39.0).toFixed(1));
      accelX = parseFloat(randomBetween(-1.2, 1.2).toFixed(3));
      accelY = parseFloat(randomBetween(-1.2, 1.2).toFixed(3));
      accelZ = parseFloat(randomBetween(0.6, 1.4).toFixed(3));
      gyroX = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
      gyroY = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
      gyroZ = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
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

    heartRateRecords.push({ cowId, bpm, measuredAt });
    temperatureRecords.push({ cowId, celsius, measuredAt });
    accelerometerRecords.push({
      cowId,
      accelX,
      accelY,
      accelZ,
      gyroX,
      gyroY,
      gyroZ,
      measuredAt,
    });
  }

  return { heartRateRecords, temperatureRecords, accelerometerRecords };
};

// ========== SEED MAIN ==========

async function main() {
  console.log("🚀 Iniciando SEED com dados massivos...\n");
  console.log("🧹 Limpando banco de dados...");

  // Delete em ordem de dependência (foreign keys)
  await prisma.accelerometerData.deleteMany({});
  await prisma.temperatureData.deleteMany({});
  await prisma.heartRateData.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.cow.deleteMany({});
  await prisma.collar.deleteMany({});
  await prisma.farm.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.permissionGroupPermission.deleteMany({});
  await prisma.permissionGroup.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});

  console.log("✅ Banco limpo!\n");

  // ===== PERMISSÕES =====
  console.log("📋 Criando permissões...");
  const permissionNames = [
    "ViewAny Farm", "View Farm", "Create Farm", "Update Farm", "Delete Farm",
    "ViewAny Collar", "View Collar", "Create Collar", "Update Collar", "Delete Collar",
    "ViewAny Cow", "View Cow", "Create Cow", "Update Cow", "Delete Cow",
    "ViewAny User", "View User", "Create User", "Update User", "Delete User",
    "ViewAny Role", "View Role", "Create Role", "Update Role", "Delete Role",
    "ViewAny Permission", "View Permission", "Create Permission", "Update Permission", "Delete Permission",
    "ViewAny PermissionGroup", "View PermissionGroup", "Create PermissionGroup", "Update PermissionGroup", "Delete PermissionGroup",
    "ViewAny Notification", "View Notification",
  ];

  const createdPermissions = await Promise.all(
    permissionNames.map((name) =>
      prisma.permission.create({ data: { name } })
    )
  );

  // ===== ROLES =====
  console.log("👥 Criando roles...");
  const superAdminRole = await prisma.role.create({
    data: {
      name: "SuperAdmin",
      description: "Acesso total",
      permissions: { create: createdPermissions.map((p) => ({ permissionId: p.id })) },
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: "Administrador",
      description: "Admin system",
      permissions: {
        create: createdPermissions
          .filter((p) => !p.name.includes("Permission"))
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const vetRole = await prisma.role.create({
    data: {
      name: "Veterinario",
      description: "Dados de saúde animal",
      permissions: {
        create: createdPermissions
          .filter((p) =>
            p.name.includes("ViewAny") ||
            p.name.includes("View") ||
            p.name.includes("Cow") ||
            p.name.includes("Notification")
          )
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  // ===== USUÁRIOS =====
  console.log("👤 Criando 5 usuários com diferentes perfis...");
  const users = [
    { name: "Administrador", email: "admin@admin.com", profile: UserProfile.ADMIN, role: superAdminRole },
    { name: "João Veterinário", email: "joao@vet.com", profile: UserProfile.MANAGER, role: vetRole },
    { name: "Maria Produtora", email: "maria@farm.com", profile: UserProfile.VIEWER, role: vetRole },
    { name: "Pedro Gerente", email: "pedro@farm.com", profile: UserProfile.MANAGER, role: adminRole },
    { name: "Ana Observadora", email: "ana@farm.com", profile: UserProfile.VIEWER, role: vetRole },
  ];

  const createdUsers = await Promise.all(
    users.map(async (user) => {
      const passwordHash = await bcrypt.hash("password123", 12);
      return prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          passwordHash,
          profile: user.profile,
          active: true,
          roles: { create: [{ roleId: user.role.id }] },
        },
      });
    })
  );

  // ===== FAZENDAS (15) =====
  console.log("🏠 Criando 15 fazendas...");
  const farmNames = ["Aurora", "Boa Esperança", "São Bento", "Alvorada", "Esperança", "Monte Verde", "Bela Vista", "Terra Fértil", "Prosperidade", "Paraíso Rural", "Sertão Verde", "Ouro Puro", "Ventura", "Horizonte", "Abundância"];

  const createdFarms = await Promise.all(
    Array.from({ length: 15 }, (_, i) => {
      const { city, state } = generateCityState();
      return prisma.farm.create({
        data: {
          name: `Fazenda ${farmNames[i]}`,
          cnpj: generateCNPJ(),
          address: `Rod. ${["BR-", "SP-", "PR-"][i % 3]}${randomInt(100, 999)}, km ${randomInt(10, 500)}`,
          city,
          state,
          phone: `(${String(randomInt(10, 99)).padStart(2, "0")}) 9${randomInt(9000, 9999)}-${randomInt(1000, 9999)}`,
          email: `contato@fazenda${i + 1}.com.br`,
        },
      });
    })
  );

  // ===== COLARES (30) =====
  console.log("⌚ Criando 30 colares com status variado...");
  const collarStatuses: CollarStatus[] = [
    "ACTIVE",
    "INACTIVE",
    "MAINTENANCE",
    "BATTERY",
  ];
  const frequencies: DataFrequency[] = ["HIGHER", "DEFAULT", "LOWER"];

  const createdCollars = await Promise.all(
    Array.from({ length: 30 }, (_, i) =>
      prisma.collar.create({
        data: {
          name: generateCollarName(i),
          // Status padrão - os valores que funcionam
        },
      })
    )
  );

  // ===== VACAS (150) =====
  console.log("🐄 Criando 150 vacas distribuídas nas fazendas...");
  const cowStatuses = [CowStatus.HEALTHY, CowStatus.HEAT_STRESS, CowStatus.CALVING, CowStatus.ALERT];
  const scenarios = ["healthy", "heat_stress", "calving", "none"];

  const createdCows = await Promise.all(
    Array.from({ length: 150 }, (_, i) => {
      const farmId = createdFarms[i % createdFarms.length].id;
      // Só os primeiros 30 têm colares (porque temos 30 colares e são 1-para-1)
      const hasCollar = i < createdCollars.length;
      const collarId = hasCollar ? createdCollars[i].id : null;
      const status = randomElement(cowStatuses);
      const scenario = hasCollar ? randomElement(scenarios) : "none";

      return prisma.cow.create({
        data: {
          tag: generateCowTag(i),
          name: generateCowName(),
          breed: generateBreed(),
          birthDate: new Date(Date.now() - randomInt(365, 3650) * 24 * 60 * 60 * 1000),
          weight: randomBetween(380, 650),
          status,
          farmId,
          collarId,
        },
      });
    })
  );

  // ===== DADOS DE SENSORES (30 DIAS) =====
  console.log("📊 Criando dados de sensores (30 dias por vaca com colares)...");
  const HOURS_OF_DATA = 24 * 30;
  let totalSensorRecords = 0;
  let cowsWithData = 0;

  for (let i = 0; i < createdCows.length; i++) {
    const cow = createdCows[i];
    const cowObj = await prisma.cow.findUnique({ where: { id: cow.id } });

    if (!cowObj || !cowObj.collarId) continue;

    cowsWithData++;
    const scenario = randomElement(scenarios);
    const { heartRateRecords, temperatureRecords, accelerometerRecords } =
      generateSensorReadings(cow.id, HOURS_OF_DATA, scenario);

    await prisma.heartRateData.createMany({ data: heartRateRecords });
    await prisma.temperatureData.createMany({ data: temperatureRecords });
    await prisma.accelerometerData.createMany({ data: accelerometerRecords });

    totalSensorRecords += heartRateRecords.length * 3;

    if (i % 20 === 0) {
      process.stdout.write(`   Progresso: ${cowsWithData} vacas processadas...\r`);
    }
  }

  console.log(`   ✅ ${totalSensorRecords.toLocaleString()} registros de sensores criados (${cowsWithData} vacas com colares)`);

  // ===== NOTIFICAÇÕES (50+) =====
  console.log("🔔 Criando notificações de alerta variadas...");
  const notifications = [];
  const alertTitles = [
    "Alerta: Estresse térmico detectado",
    "Alerta: Parto iminente detectado",
    "Alerta: Parâmetros fora do normal",
    "Alerta: Frequência cardíaca elevada",
    "Alerta: Temperatura corporal anormal",
    "Alerta: Movimento reduzido",
    "Aviso: Colar com bateria baixa",
    "Aviso: Colar fora de cobertura",
  ];

  for (let i = 0; i < 50; i++) {
    const randomCow = randomElement(createdCows);
    const randomUser = randomElement(createdUsers);
    const isRead = Math.random() > 0.4; // 60% lidas

    notifications.push({
      userId: randomUser.id,
      cowId: randomCow.id,
      title: randomElement(alertTitles),
      message: `Alerta automático para ${randomCow.name} (${randomCow.tag}). Verifique os parâmetros de saúde nos últimos dados.`,
      readAt: isRead ? new Date(Date.now() - randomInt(1, 168) * 60 * 60 * 1000) : null,
    });
  }

  await prisma.notification.createMany({ data: notifications });
  console.log(`   ✅ ${notifications.length} notificações criadas`);

  // ===== RESUME =====
  console.log("\n✅ SEED CONCLUÍDO COM SUCESSO!\n");
  console.log(`📊 Dados criados:`);
  console.log(`   • Usuários: ${createdUsers.length}`);
  console.log(`   • Fazendas: ${createdFarms.length}`);
  console.log(`   • Colares: ${createdCollars.length}`);
  console.log(`   • Vacas: ${createdCows.length}`);
  console.log(`   • Registros de sensores: ${totalSensorRecords.toLocaleString()}`);
  console.log(`   • Notificações: ${notifications.length}`);
  console.log(`\n🔑 Acesso (todos com senha 'password123'):`);
  console.log(`   • admin@admin.com (Super Admin)`);
  console.log(`   • joao@vet.com (Veterinário)`);
  console.log(`   • maria@farm.com (Produtora)`);
  console.log(`   • pedro@farm.com (Gerente)`);
  console.log(`   • ana@farm.com (Observadora)\n`);
}

main()
  .catch((error) => {
    console.error("❌ Erro no seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
