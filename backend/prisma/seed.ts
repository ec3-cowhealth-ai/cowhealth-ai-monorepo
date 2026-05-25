import { PrismaClient, CowStatus, CollarStatus, DataFrequency } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Permissões
// Padrão: "ViewAny" = listar todos | "View" = ver um | "Create/Update/Delete" = ações

const permissionNames = [
  "ViewAny Farm",   "View Farm",   "Create Farm",   "Update Farm",   "Delete Farm",
  "ViewAny Collar", "View Collar", "Create Collar", "Update Collar", "Delete Collar",
  "ViewAny Cow",    "View Cow",    "Create Cow",    "Update Cow",    "Delete Cow",
  "ViewAny User",   "View User",   "Create User",   "Update User",   "Delete User",
  "ViewAny Role",   "View Role",   "Create Role",   "Update Role",   "Delete Role",
  "ViewAny Permission",      "View Permission",      "Create Permission",      "Update Permission",      "Delete Permission",
  "ViewAny PermissionGroup", "View PermissionGroup", "Create PermissionGroup", "Update PermissionGroup", "Delete PermissionGroup",
  "ViewAny Notification", "View Notification",
];

// Nomes dos colares ACTIVE
// IDs gerados por `python scripts/generate_collars.py --seed 42` no repositório IoT.
// Hardcoded para garantir paridade entre qualquer máquina do time e o simulador.
// Formato: collar-NNN — deve bater com o device_id publicado pelo simulador.

const ACTIVE_COLLAR_IDS: string[] = [
  "collar-001", "collar-002", "collar-003", "collar-004", "collar-005", "collar-006", "collar-007", "collar-008", "collar-009", "collar-010",
  "collar-011", "collar-012", "collar-013", "collar-014", "collar-015", "collar-016", "collar-017", "collar-018", "collar-019", "collar-020",
  "collar-021", "collar-022", "collar-023", "collar-024", "collar-025", "collar-026", "collar-027", "collar-028", "collar-029", "collar-030",
  "collar-031", "collar-032", "collar-033", "collar-034", "collar-035", "collar-036", "collar-037", "collar-038", "collar-039", "collar-040",
  "collar-041", "collar-042", "collar-043", "collar-044", "collar-045", "collar-046", "collar-047", "collar-048", "collar-049", "collar-050",
  "collar-051", "collar-052", "collar-053", "collar-054", "collar-055", "collar-056", "collar-057", "collar-058", "collar-059", "collar-060",
  "collar-061", "collar-062", "collar-063", "collar-064", "collar-065", "collar-066", "collar-067", "collar-068", "collar-069", "collar-070",
  "collar-071", "collar-072", "collar-073", "collar-074", "collar-075", "collar-076", "collar-077", "collar-078", "collar-079", "collar-080",
  "collar-081", "collar-082", "collar-083", "collar-084", "collar-085", "collar-086", "collar-087", "collar-088", "collar-089", "collar-090",
  "collar-091", "collar-092", "collar-093", "collar-094", "collar-095", "collar-096", "collar-097", "collar-098", "collar-099", "collar-100",
  "collar-101", "collar-102", "collar-103", "collar-104", "collar-105", "collar-106", "collar-107", "collar-108", "collar-109", "collar-110",
  "collar-111", "collar-112", "collar-113", "collar-114", "collar-115", "collar-116", "collar-117", "collar-118", "collar-119", "collar-120",
  "collar-121", "collar-122", "collar-123", "collar-124", "collar-125", "collar-126", "collar-127", "collar-128", "collar-129", "collar-130",
  "collar-131", "collar-132", "collar-133", "collar-134", "collar-135", "collar-136", "collar-137", "collar-138", "collar-139", "collar-140",
  "collar-141", "collar-142", "collar-143", "collar-144", "collar-145", "collar-146", "collar-147", "collar-148", "collar-149", "collar-150",
  "collar-151", "collar-152", "collar-153", "collar-154", "collar-155", "collar-156", "collar-157", "collar-158", "collar-159", "collar-160",
];

// Dados de fazendas

const farmData = [
  { name: "Fazenda Aurora",        cnpj: "11.111.111/0001-01", city: "Curitiba",      state: "PR", phone: "(41) 99000-0001", email: "aurora@cowhealth.com",       latitude: -23.401850, longitude: -51.124920 },
  { name: "Fazenda Sao Bento",     cnpj: "22.222.222/0001-02", city: "Londrina",      state: "PR", phone: "(43) 99000-0002", email: "saobento@cowhealth.com",     latitude: -19.829420, longitude: -47.867680 },
  { name: "Fazenda Boa Esperanca", cnpj: "33.333.333/0001-03", city: "Maringa",       state: "PR", phone: "(44) 99000-0003", email: "boaesperanca@cowhealth.com", latitude: -16.765300, longitude: -49.072400 },
  { name: "Fazenda Santa Clara",   cnpj: "44.444.444/0001-04", city: "Ponta Grossa",  state: "PR", phone: "(42) 99000-0004", email: "santaclara@cowhealth.com",   latitude: -20.603800, longitude: -48.628600 },
  { name: "Fazenda Vale Verde",    cnpj: "55.555.555/0001-05", city: "Cascavel",      state: "PR", phone: "(45) 99000-0005", email: "valeverde@cowhealth.com",    latitude: -15.739500, longitude: -56.048200 },
];

// Distribuição de status das vacas
// Distribuição realista baseada em dados de campo:
// HEALTHY ~69% | HEAT_STRESS ~12% | ALERT ~12% | CALVING ~6%
// Total: 160 vacas (32 por fazenda)

const COW_STATUS_DISTRIBUTION: CowStatus[] = [
  ...Array(111).fill(CowStatus.HEALTHY),    // ~69%
  ...Array(19).fill(CowStatus.HEAT_STRESS), // ~12%
  ...Array(19).fill(CowStatus.ALERT),       // ~12%
  ...Array(11).fill(CowStatus.CALVING),     // ~6% (ajustado para totalizar 160)
];

// Embaralhar deterministicamente para distribuir entre fazendas
const shuffleStatuses = (statuses: CowStatus[]): CowStatus[] => {
  const shuffled = [...statuses];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor((i * 1664525 + 1013904223) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const SHUFFLED_STATUSES = shuffleStatuses(COW_STATUS_DISTRIBUTION);

const BREEDS = ["Nelore", "Gir", "Holandesa", "Angus", "Brahman", "Senepol", "Girolando", "Jersey"];
const COW_NAMES = [
  "Mimosa", "Bonita", "Estrela", "Clarinha", "Morena", "Pintada", "Mansinha", "Branquinha",
  "Moreninha", "Florzinha", "Docinha", "Levinha", "Gordinha", "Pretinha", "Ruivinha", "Listrada",
  "Faceira", "Meiga", "Fofa", "Linda", "Querida", "Calma", "Mansa", "Pacata",
  "Serena", "Alegre", "Bela", "Graciosa", "Elegante", "Nobre", "Real", "Fina",
];

// Helpers

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const dateHoursAgo  = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

// Seed principal

async function main() {
  console.log("Iniciando seed...");

  // Permissões
  console.log("Criando permissões...");
  const createdPermissions = await Promise.all(
    permissionNames.map((name) =>
      prisma.permission.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const farmPermissions         = createdPermissions.filter((p) => p.name.includes("Farm"));
  const collarPermissions       = createdPermissions.filter((p) => p.name.includes("Collar"));
  const cowPermissions          = createdPermissions.filter((p) => p.name.includes("Cow"));
  const userPermissions         = createdPermissions.filter((p) => p.name.includes("User"));
  const notificationPermissions = createdPermissions.filter((p) => p.name.includes("Notification"));
  const viewOnlyFarm            = farmPermissions.filter((p) => p.name.startsWith("ViewAny") || p.name.startsWith("View"));
  const viewOnlyCow             = cowPermissions.filter((p) => p.name.startsWith("ViewAny") || p.name.startsWith("View"));
  const viewOnlyCollar          = collarPermissions.filter((p) => p.name.startsWith("ViewAny") || p.name.startsWith("View"));

  // Grupos de permissões
  console.log("Criando grupos de permissões...");
  for (const [groupName, permissions] of [
    ["Fazendas", farmPermissions],
    ["Colares",  collarPermissions],
    ["Vacas",    cowPermissions],
  ] as const) {
    await prisma.permissionGroup.upsert({
      where:  { name: groupName },
      update: {},
      create: {
        name: groupName,
        permissions: { create: permissions.map((p) => ({ permissionId: p.id })) },
      },
    });
  }

  // Roles
  console.log("Criando roles...");

  const superAdminRole = await prisma.role.upsert({
    where:  { name: "SuperAdmin" },
    update: {},
    create: {
      name: "SuperAdmin",
      description: "Acesso total ao sistema, incluindo gerenciamento de permissões",
      permissions: { create: createdPermissions.map((p) => ({ permissionId: p.id })) },
    },
  });

  const adminRole = await prisma.role.upsert({
    where:  { name: "Administrador" },
    update: {},
    create: {
      name: "Administrador",
      description: "Acesso administrativo ao sistema, exceto gerenciamento de permissões",
      permissions: {
        create: createdPermissions
          .filter((p) => !p.name.includes("Permission"))
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const veterinarianRole = await prisma.role.upsert({
    where:  { name: "Veterinario" },
    update: {},
    create: {
      name: "Veterinario",
      description: "Acesso aos dados de saúde dos animais e histórico de sensores",
      permissions: {
        create: [...viewOnlyFarm, ...viewOnlyCollar, ...cowPermissions, ...notificationPermissions]
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const zootecnistaRole = await prisma.role.upsert({
    where:  { name: "Zootecnista" },
    update: {},
    create: {
      name: "Zootecnista",
      description: "Gestão técnica do rebanho e dados zootécnicos",
      permissions: {
        create: [...viewOnlyFarm, ...viewOnlyCollar, ...cowPermissions, ...notificationPermissions]
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const gerenteFazendaRole = await prisma.role.upsert({
    where:  { name: "Gerente de Fazenda" },
    update: {},
    create: {
      name: "Gerente de Fazenda",
      description: "Gestão operacional da fazenda e rebanho",
      permissions: {
        create: [...viewOnlyFarm, ...viewOnlyCollar, ...viewOnlyCow, ...notificationPermissions]
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const operadorRole = await prisma.role.upsert({
    where:  { name: "Operador de Campo" },
    update: {},
    create: {
      name: "Operador de Campo",
      description: "Visualização de vacas e fazendas para operações em campo",
      permissions: {
        create: [...viewOnlyFarm, ...viewOnlyCow]
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const financeiroRole = await prisma.role.upsert({
    where:  { name: "Financeiro" },
    update: {},
    create: {
      name: "Financeiro",
      description: "Visualização de dados de fazendas para fins financeiros",
      permissions: {
        create: [...viewOnlyFarm, ...viewOnlyCow]
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const observadorRole = await prisma.role.upsert({
    where:  { name: "Observador" },
    update: {},
    create: {
      name: "Observador",
      description: "Acesso de leitura ao sistema sem permissão de edição",
      permissions: {
        create: [...viewOnlyFarm, ...viewOnlyCow, ...notificationPermissions]
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const producerRole = await prisma.role.upsert({
    where:  { name: "Produtor" },
    update: {},
    create: {
      name: "Produtor",
      description: "Acesso de leitura ao rebanho e fazendas próprias",
      permissions: {
        create: [...viewOnlyFarm, ...viewOnlyCow, ...notificationPermissions]
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  console.log("Roles criadas: SuperAdmin, Administrador, Veterinario, Zootecnista, Gerente de Fazenda, Operador de Campo, Financeiro, Observador, Produtor");

  // Usuários
  console.log("Criando usuários...");
  const PASSWORD = "12345678";

  const userData = [
    { name: "Super Admin",        email: "admin@cowhealth.com",         profile: "ADMIN"   as const, roleModel: superAdminRole },
    { name: "Administrador",      email: "administrador@cowhealth.com", profile: "ADMIN"   as const, roleModel: adminRole },
    { name: "Veterinario",        email: "vet@cowhealth.com",           profile: "MANAGER" as const, roleModel: veterinarianRole },
    { name: "Zootecnista",        email: "zoot@cowhealth.com",          profile: "MANAGER" as const, roleModel: zootecnistaRole },
    { name: "Gerente de Fazenda", email: "gerente@cowhealth.com",       profile: "MANAGER" as const, roleModel: gerenteFazendaRole },
    { name: "Operador de Campo",  email: "operador@cowhealth.com",      profile: "VIEWER"  as const, roleModel: operadorRole },
    { name: "Financeiro",         email: "financeiro@cowhealth.com",    profile: "VIEWER"  as const, roleModel: financeiroRole },
    { name: "Observador",         email: "obs@cowhealth.com",           profile: "VIEWER"  as const, roleModel: observadorRole },
  ];

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const createdUsers = await Promise.all(
    userData.map(({ name, email, profile, roleModel }) =>
      prisma.user.upsert({
        where:  { email },
        update: {},
        create: {
          name,
          email,
          passwordHash,
          profile,
          active: true,
          roles: { create: [{ roleId: roleModel.id }] },
        },
      })
    )
  );

  console.log(`${createdUsers.length} usuários criados`);

  // Fazendas
  console.log("Criando fazendas...");
  const createdFarms = await Promise.all(
    farmData.map((farm) =>
      prisma.farm.upsert({ where: { cnpj: farm.cnpj }, update: {}, create: farm })
    )
  );

  // Colares — 200 total
  // 160 ACTIVE (nomes do simulador IoT) + 20 INACTIVE (estoque) + 10 MAINTENANCE + 5 INACTIVE + 5 BATTERY
  console.log("Criando colares (200)...");

  const collarData = [
    ...ACTIVE_COLLAR_IDS.map((name) => ({
      name,
      status: CollarStatus.ACTIVE,
      dataFrequency: DataFrequency.DEFAULT,
    })),
    ...Array.from({ length: 20 }, (_, i) => ({
      name:          `STCK${String(i + 1).padStart(4, "0")}`,
      status:        CollarStatus.INACTIVE,
      dataFrequency: DataFrequency.DEFAULT,
    })),
    ...Array.from({ length: 10 }, (_, i) => ({
      name:          `MANT${String(i + 1).padStart(4, "0")}`,
      status:        CollarStatus.MAINTENANCE,
      dataFrequency: DataFrequency.DEFAULT,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
      name:          `INAC${String(i + 1).padStart(4, "0")}`,
      status:        CollarStatus.INACTIVE,
      dataFrequency: DataFrequency.LOWER,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
      name:          `BATT${String(i + 1).padStart(4, "0")}`,
      status:        CollarStatus.BATTERY,
      dataFrequency: DataFrequency.LOWER,
    })),
  ];

  const createdCollars = await Promise.all(
    collarData.map((collar) =>
      prisma.collar.upsert({ where: { name: collar.name }, update: {}, create: collar })
    )
  );

  console.log(`${createdCollars.length} colares criados`);

  // Vacas — 160 total (32 por fazenda)
  console.log("Criando vacas (160)...");

  const COWS_PER_FARM = 32;
  let statusIndex    = 0;
  let collarIndex    = 0;
  const createdCows  = [];

  for (let farmIndex = 0; farmIndex < createdFarms.length; farmIndex++) {
    const farm = createdFarms[farmIndex];

    for (let cowIndex = 0; cowIndex < COWS_PER_FARM; cowIndex++) {
      const globalIndex = farmIndex * COWS_PER_FARM + cowIndex;
      const status      = SHUFFLED_STATUSES[statusIndex++];
      const tag         = `BR-${String(globalIndex + 1).padStart(3, "0")}`;
      const name        = COW_NAMES[cowIndex % COW_NAMES.length];
      const breed       = BREEDS[globalIndex % BREEDS.length];
      const weight      = Math.round(randomBetween(380, 580));

      // Vincula colar ACTIVE (os 160 primeiros colares)
      const collar = createdCollars[collarIndex++];

      const cow = await prisma.cow.upsert({
        where:  { tag },
        update: {},
        create: {
          tag,
          name,
          breed,
          weight,
          status,
          farmId:   farm.id,
          collarId: collar.id,
        },
      });

      createdCows.push({ cow, scenario: status });
    }
  }

  console.log(`${createdCows.length} vacas criadas`);

  // Dados de sensores — 1 semana de historico para todas as vacas com colar
  console.log("Criando dados de sensores (1 semana por vaca — isso pode demorar)...");

  const HOURS_OF_DATA = 168;

  for (const { cow, scenario } of createdCows) {
    const heartRateRecords     = [];
    const temperatureRecords   = [];
    const accelerometerRecords = [];
    const isRecentAlert        = true; // todas as vacas têm dados completos

    for (let hoursAgo = HOURS_OF_DATA; hoursAgo >= 0; hoursAgo--) {
      const measuredAt    = dateHoursAgo(hoursAgo);
      const isAlertWindow = hoursAgo <= 6;

      let bpm: number, celsius: number;
      let accelX: number, accelY: number, accelZ: number;
      let gyroX:  number, gyroY:  number, gyroZ:  number;

      if (scenario === CowStatus.HEAT_STRESS && isAlertWindow) {
        bpm     = Math.round(randomBetween(102, 118));
        celsius = parseFloat(randomBetween(39.2, 40.1).toFixed(1));
        accelX  = parseFloat(randomBetween(0.9, 1.8).toFixed(3));
        accelY  = parseFloat(randomBetween(0.9, 1.8).toFixed(3));
        accelZ  = parseFloat(randomBetween(8.5, 10.5).toFixed(3));
        gyroX   = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
        gyroY   = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
        gyroZ   = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
      } else if (scenario === CowStatus.CALVING && isAlertWindow) {
        const tempBase = 38.8 - (hoursAgo * 0.05);
        bpm     = Math.round(randomBetween(92, 108));
        celsius = parseFloat(Math.min(Math.max(tempBase + randomBetween(-0.2, 0.2), 37.5), 39.0).toFixed(1));
        accelX  = parseFloat(randomBetween(-1.2, 1.2).toFixed(3));
        accelY  = parseFloat(randomBetween(-1.2, 1.2).toFixed(3));
        accelZ  = parseFloat(randomBetween(0.6, 1.4).toFixed(3));
        gyroX   = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
        gyroY   = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
        gyroZ   = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
      } else {
        bpm     = Math.round(randomBetween(58, 82));
        celsius = parseFloat(randomBetween(37.8, 38.8).toFixed(1));
        accelX  = parseFloat(randomBetween(-0.6, 0.6).toFixed(3));
        accelY  = parseFloat(randomBetween(-0.6, 0.6).toFixed(3));
        accelZ  = parseFloat(randomBetween(9.0, 10.0).toFixed(3));
        gyroX   = parseFloat(randomBetween(-0.3, 0.3).toFixed(3));
        gyroY   = parseFloat(randomBetween(-0.3, 0.3).toFixed(3));
        gyroZ   = parseFloat(randomBetween(-0.3, 0.3).toFixed(3));
      }

      heartRateRecords.push({ cowId: cow.id, bpm, measuredAt });
      temperatureRecords.push({ cowId: cow.id, celsius, measuredAt });
      accelerometerRecords.push({ cowId: cow.id, accelX, accelY, accelZ, gyroX, gyroY, gyroZ, measuredAt });
    }

    await prisma.heartRateData.createMany({ data: heartRateRecords });
    await prisma.temperatureData.createMany({ data: temperatureRecords });
    await prisma.accelerometerData.createMany({ data: accelerometerRecords });
  }

  console.log("Dados de sensores criados");

  // Notificações de exemplo
  console.log("Criando notificações...");
  const adminUser           = createdUsers[0];
  const heatStressCows      = createdCows.filter(({ scenario }) => scenario === CowStatus.HEAT_STRESS).slice(0, 2);
  const calvingCows         = createdCows.filter(({ scenario }) => scenario === CowStatus.CALVING).slice(0, 2);
  const alertCows           = createdCows.filter(({ scenario }) => scenario === CowStatus.ALERT).slice(0, 1);

  const notificationsData = [
    ...heatStressCows.map(({ cow }) => ({
      userId:  adminUser.id,
      cowId:   cow.id,
      title:   "Alerta: Estresse térmico detectado",
      message: `A vaca ${cow.name} (${cow.tag}) apresenta temperatura média elevada e FC acima do normal nas últimas 6 horas.`,
    })),
    ...calvingCows.map(({ cow }) => ({
      userId:  adminUser.id,
      cowId:   cow.id,
      title:   "Alerta: Parto iminente detectado",
      message: `A vaca ${cow.name} (${cow.tag}) apresenta padrão de movimentação postural intensa e queda progressiva de temperatura.`,
    })),
    ...alertCows.map(({ cow }) => ({
      userId:  adminUser.id,
      cowId:   cow.id,
      title:   "Alerta: Parâmetros fora do normal",
      message: `A vaca ${cow.name} (${cow.tag}) apresentou parâmetros fora do intervalo esperado. Avaliação recomendada.`,
      readAt:  new Date(Date.now() - 2 * 60 * 60 * 1000),
    })),
  ];

  await prisma.notification.createMany({ data: notificationsData });

  console.log("Seed concluído com sucesso.");
  console.log("---");
  console.log("Credenciais (senha: 12345678):");
  console.log("  admin@cowhealth.com          SuperAdmin");
  console.log("  administrador@cowhealth.com  Administrador");
  console.log("  vet@cowhealth.com            Veterinario");
  console.log("  zoot@cowhealth.com           Zootecnista");
  console.log("  gerente@cowhealth.com        Gerente de Fazenda");
  console.log("  operador@cowhealth.com       Operador de Campo");
  console.log("  financeiro@cowhealth.com     Financeiro");
  console.log("  obs@cowhealth.com            Observador");
}

main()
  .catch((error) => { console.error("Erro no seed:", error); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });