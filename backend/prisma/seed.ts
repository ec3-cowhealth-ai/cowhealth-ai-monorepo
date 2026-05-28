import {
  PrismaClient,
  CowStatus,
  CollarStatus,
  DataFrequency,
  ReproductiveStatus,
  ClinicalStatus,
  ActivityType,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Permissões
// Padrão: "ViewAny" = listar todos | "View" = ver um | "Create/Update/Delete" = ações

const permissionNames = [
  "ViewAny Farm",
  "View Farm",
  "Create Farm",
  "Update Farm",
  "Delete Farm",
  "ViewAny Collar",
  "View Collar",
  "Create Collar",
  "Update Collar",
  "Delete Collar",
  "ViewAny Cow",
  "View Cow",
  "Create Cow",
  "Update Cow",
  "Delete Cow",
  "ViewAny User",
  "View User",
  "Create User",
  "Update User",
  "Delete User",
  "ViewAny Role",
  "View Role",
  "Create Role",
  "Update Role",
  "Delete Role",
  "ViewAny Permission",
  "View Permission",
  "Create Permission",
  "Update Permission",
  "Delete Permission",
  "ViewAny PermissionGroup",
  "View PermissionGroup",
  "Create PermissionGroup",
  "Update PermissionGroup",
  "Delete PermissionGroup",
  "ViewAny Notification",
  "View Notification",
  "ViewAny MedicalRecord",
  "View MedicalRecord",
  "Create MedicalRecord",
  "Update MedicalRecord",
  "Delete MedicalRecord",
  "ViewAny ClinicalRecord",
  "View ClinicalRecord",
  "Create ClinicalRecord",
  "Update ClinicalRecord",
  "Delete ClinicalRecord",
  "Retire Cow",
];

// Nomes dos colares ACTIVE
// IDs gerados por `python scripts/generate_collars.py --seed 42` no repositório IoT.
// Hardcoded para garantir paridade entre qualquer máquina do time e o simulador.
// Formato: collar-NNN — deve bater com o device_id publicado pelo simulador.

const ACTIVE_COLLAR_IDS: string[] = [
  "collar-001",
  "collar-002",
  "collar-003",
  "collar-004",
  "collar-005",
  "collar-006",
  "collar-007",
  "collar-008",
  "collar-009",
  "collar-010",
  "collar-011",
  "collar-012",
  "collar-013",
  "collar-014",
  "collar-015",
  "collar-016",
  "collar-017",
  "collar-018",
  "collar-019",
  "collar-020",
  "collar-021",
  "collar-022",
  "collar-023",
  "collar-024",
  "collar-025",
  "collar-026",
  "collar-027",
  "collar-028",
  "collar-029",
  "collar-030",
  "collar-031",
  "collar-032",
  "collar-033",
  "collar-034",
  "collar-035",
  "collar-036",
  "collar-037",
  "collar-038",
  "collar-039",
  "collar-040",
  "collar-041",
  "collar-042",
  "collar-043",
  "collar-044",
  "collar-045",
  "collar-046",
  "collar-047",
  "collar-048",
  "collar-049",
  "collar-050",
  "collar-051",
  "collar-052",
  "collar-053",
  "collar-054",
  "collar-055",
  "collar-056",
  "collar-057",
  "collar-058",
  "collar-059",
  "collar-060",
  "collar-061",
  "collar-062",
  "collar-063",
  "collar-064",
  "collar-065",
  "collar-066",
  "collar-067",
  "collar-068",
  "collar-069",
  "collar-070",
  "collar-071",
  "collar-072",
  "collar-073",
  "collar-074",
  "collar-075",
  "collar-076",
  "collar-077",
  "collar-078",
  "collar-079",
  "collar-080",
  "collar-081",
  "collar-082",
  "collar-083",
  "collar-084",
  "collar-085",
  "collar-086",
  "collar-087",
  "collar-088",
  "collar-089",
  "collar-090",
  "collar-091",
  "collar-092",
  "collar-093",
  "collar-094",
  "collar-095",
  "collar-096",
  "collar-097",
  "collar-098",
  "collar-099",
  "collar-100",
  "collar-101",
  "collar-102",
  "collar-103",
  "collar-104",
  "collar-105",
  "collar-106",
  "collar-107",
  "collar-108",
  "collar-109",
  "collar-110",
  "collar-111",
  "collar-112",
  "collar-113",
  "collar-114",
  "collar-115",
  "collar-116",
  "collar-117",
  "collar-118",
  "collar-119",
  "collar-120",
  "collar-121",
  "collar-122",
  "collar-123",
  "collar-124",
  "collar-125",
  "collar-126",
  "collar-127",
  "collar-128",
  "collar-129",
  "collar-130",
  "collar-131",
  "collar-132",
  "collar-133",
  "collar-134",
  "collar-135",
  "collar-136",
  "collar-137",
  "collar-138",
  "collar-139",
  "collar-140",
  "collar-141",
  "collar-142",
  "collar-143",
  "collar-144",
  "collar-145",
  "collar-146",
  "collar-147",
  "collar-148",
  "collar-149",
  "collar-150",
  "collar-151",
  "collar-152",
  "collar-153",
  "collar-154",
  "collar-155",
  "collar-156",
  "collar-157",
  "collar-158",
  "collar-159",
  "collar-160",
];

// Dados de fazendas

const farmData = [
  {
    name: "Fazenda Aurora",
    cnpj: "11.111.111/0001-01",
    city: "Curitiba",
    state: "PR",
    phone: "(41) 99000-0001",
    email: "aurora@cowhealth.com",
    latitude: -23.40185,
    longitude: -51.12492,
  },
  {
    name: "Fazenda Sao Bento",
    cnpj: "22.222.222/0001-02",
    city: "Londrina",
    state: "PR",
    phone: "(43) 99000-0002",
    email: "saobento@cowhealth.com",
    latitude: -19.82942,
    longitude: -47.86768,
  },
  {
    name: "Fazenda Boa Esperanca",
    cnpj: "33.333.333/0001-03",
    city: "Maringa",
    state: "PR",
    phone: "(44) 99000-0003",
    email: "boaesperanca@cowhealth.com",
    latitude: -16.7653,
    longitude: -49.0724,
  },
  {
    name: "Fazenda Santa Clara",
    cnpj: "44.444.444/0001-04",
    city: "Ponta Grossa",
    state: "PR",
    phone: "(42) 99000-0004",
    email: "santaclara@cowhealth.com",
    latitude: -20.6038,
    longitude: -48.6286,
  },
  {
    name: "Fazenda Vale Verde",
    cnpj: "55.555.555/0001-05",
    city: "Cascavel",
    state: "PR",
    phone: "(45) 99000-0005",
    email: "valeverde@cowhealth.com",
    latitude: -15.7395,
    longitude: -56.0482,
  },
];

// Distribuição de status das vacas
// Distribuição realista baseada em dados de campo:
// HEALTHY ~69% | HEAT_STRESS ~12% | ALERT ~12% | CALVING ~6%
// Total: 160 vacas (32 por fazenda)

const COW_STATUS_DISTRIBUTION: CowStatus[] = [
  ...Array(111).fill(CowStatus.HEALTHY), // ~69%
  ...Array(19).fill(CowStatus.HEAT_STRESS), // ~12%
  ...Array(19).fill(CowStatus.ALERT), // ~12%
  ...Array(11).fill(CowStatus.CALVING), // ~6% (ajustado para totalizar 160)
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
  "Mimosa",
  "Bonita",
  "Estrela",
  "Clarinha",
  "Morena",
  "Pintada",
  "Mansinha",
  "Branquinha",
  "Moreninha",
  "Florzinha",
  "Docinha",
  "Levinha",
  "Gordinha",
  "Pretinha",
  "Ruivinha",
  "Listrada",
  "Faceira",
  "Meiga",
  "Fofa",
  "Linda",
  "Querida",
  "Calma",
  "Mansa",
  "Pacata",
  "Serena",
  "Alegre",
  "Bela",
  "Graciosa",
  "Elegante",
  "Nobre",
  "Real",
  "Fina",
];

// Helpers

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const dateHoursAgo = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

// Seed principal

async function main() {
  console.log("Iniciando seed...");

  // Permissões
  console.log("Criando permissões...");
  const createdPermissions = await Promise.all(
    permissionNames.map((name) =>
      prisma.permission.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );

  const farmPermissions = createdPermissions.filter((p) => p.name.includes("Farm"));
  const collarPermissions = createdPermissions.filter((p) => p.name.includes("Collar"));
  const cowPermissions = createdPermissions.filter((p) => p.name.includes("Cow"));
  const notificationPermissions = createdPermissions.filter((p) => p.name.includes("Notification"));
  const viewOnlyFarm = farmPermissions.filter(
    (p) => p.name.startsWith("ViewAny") || p.name.startsWith("View"),
  );
  const viewOnlyCow = cowPermissions.filter(
    (p) => p.name.startsWith("ViewAny") || p.name.startsWith("View"),
  );
  const viewOnlyCollar = collarPermissions.filter(
    (p) => p.name.startsWith("ViewAny") || p.name.startsWith("View"),
  );
  const medicalRecordPermissions    = createdPermissions.filter((p) => p.name.includes("MedicalRecord"));
  const viewOnlyMedicalRecord       = medicalRecordPermissions.filter((p) => p.name.startsWith("ViewAny") || p.name.startsWith("View"));
  const clinicalRecordPermissions   = createdPermissions.filter((p) => p.name.includes("ClinicalRecord"));
  const viewOnlyClinicalRecord      = clinicalRecordPermissions.filter((p) => p.name.startsWith("ViewAny") || p.name.startsWith("View"));
  const retireCowPermission         = createdPermissions.filter((p) => p.name === "Retire Cow");

  // Grupos de permissões
  console.log("Criando grupos de permissões...");
  for (const [groupName, permissions] of [
    ["Fazendas", farmPermissions],
    ["Colares", collarPermissions],
    ["Vacas", cowPermissions],
    ["Prontuario", medicalRecordPermissions],
    ["Prontuario Clinico", clinicalRecordPermissions],
  ] as const) {
    await prisma.permissionGroup.upsert({
      where: { name: groupName },
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
    where: { name: "SuperAdmin" },
    update: {},
    create: {
      name: "SuperAdmin",
      description: "Acesso total ao sistema, incluindo gerenciamento de permissões",
      permissions: { create: createdPermissions.map((p) => ({ permissionId: p.id })) },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "Administrador" },
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
    where: { name: "Veterinario" },
    update: {},
    create: {
      name: "Veterinario",
      description: "Acesso aos dados de saúde dos animais e histórico de sensores",
      permissions: {
        create: [
          ...viewOnlyFarm,
          ...viewOnlyCollar,
          ...cowPermissions,
          ...notificationPermissions,
          ...medicalRecordPermissions,
          ...clinicalRecordPermissions,
        ].map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const zootecnistaRole = await prisma.role.upsert({
    where: { name: "Zootecnista" },
    update: {},
    create: {
      name: "Zootecnista",
      description: "Gestão técnica do rebanho e dados zootécnicos",
      permissions: {
        create: [
          ...viewOnlyFarm,
          ...viewOnlyCollar,
          ...cowPermissions,
          ...notificationPermissions,
          ...viewOnlyMedicalRecord,
          ...viewOnlyClinicalRecord,
        ].map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const gerenteFazendaRole = await prisma.role.upsert({
    where: { name: "Gerente de Fazenda" },
    update: {},
    create: {
      name: "Gerente de Fazenda",
      description: "Gestão operacional da fazenda e rebanho",
      permissions: {
        create: [
          ...viewOnlyFarm,
          ...viewOnlyCollar,
          ...viewOnlyCow,
          ...notificationPermissions,
          ...viewOnlyMedicalRecord,
          ...viewOnlyClinicalRecord,
          ...retireCowPermission,
          ...cowPermissions.filter((p) => p.name === "Create Cow" || p.name === "Update Cow"),
        ].map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const operadorRole = await prisma.role.upsert({
    where: { name: "Operador de Campo" },
    update: {},
    create: {
      name: "Operador de Campo",
      description: "Visualização de vacas e fazendas para operações em campo",
      permissions: {
        create: [...viewOnlyFarm, ...viewOnlyCow, ...notificationPermissions].map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const financeiroRole = await prisma.role.upsert({
    where: { name: "Financeiro" },
    update: {},
    create: {
      name: "Financeiro",
      description: "Visualização de dados de fazendas para fins financeiros",
      permissions: {
        create: [...viewOnlyFarm, ...viewOnlyCow, ...viewOnlyCollar].map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const observadorRole = await prisma.role.upsert({
    where: { name: "Observador" },
    update: {},
    create: {
      name: "Observador",
      description: "Acesso de leitura ao sistema sem permissão de edição",
      permissions: {
        create: [...viewOnlyFarm, ...viewOnlyCow, ...notificationPermissions].map((p) => ({
          permissionId: p.id,
        })),
      },
    },
  });

  await prisma.role.upsert({
    where: { name: "Produtor" },
    update: {},
    create: {
      name: "Produtor",
      description: "Acesso de leitura ao rebanho e fazendas próprias",
      permissions: {
        create: [
          ...viewOnlyFarm,
          ...viewOnlyCow,
          ...notificationPermissions,
          ...viewOnlyCollar,
          ...viewOnlyMedicalRecord,
          ...viewOnlyClinicalRecord,
        ].map((p) => ({ permissionId: p.id })),
      },
    },
  });

  console.log(
    "Roles criadas: SuperAdmin, Administrador, Veterinario, Zootecnista, Gerente de Fazenda, Operador de Campo, Financeiro, Observador, Produtor",
  );

  // Fazendas — Criar ANTES dos usuários para evitar violação de FK
  console.log("Criando fazendas...");
  const createdFarms = await Promise.all(
    farmData.map((farm) =>
      prisma.farm.upsert({ where: { cnpj: farm.cnpj }, update: {}, create: farm }),
    ),
  );

  // Usuários
  console.log("Criando usuários...");
  const PASSWORD = "12345678";

  const aurora = createdFarms[0];
  const saoBento = createdFarms[1];
  const boaEsperanca = createdFarms[2];
  const santaClara = createdFarms[3];
  const valeVerde = createdFarms[4];

  const userData = [
    {
      name: "Super Admin",
      email: "admin@cowhealth.com",
      roleModel: superAdminRole,
      farmId: null,
    },
    {
      name: "Administrador Aurora",
      email: "administrador@aurora.com",
      roleModel: adminRole,
      farmId: aurora.id,
    },
    {
      name: "Administrador Sao Bento",
      email: "administrador@saobento.com",
      roleModel: adminRole,
      farmId: saoBento.id,
    },
    {
      name: "Administrador Boa Esperanca",
      email: "administrador@boaesperanca.com",
      roleModel: adminRole,
      farmId: boaEsperanca.id,
    },
    {
      name: "Administrador Santa Clara",
      email: "administrador@santaclara.com",
      roleModel: adminRole,
      farmId: santaClara.id,
    },
    {
      name: "Administrador Vale Verde",
      email: "administrador@valeverde.com",
      roleModel: adminRole,
      farmId: valeVerde.id,
    },
    {
      name: "Veterinario",
      email: "vet@cowhealth.com",
      roleModel: veterinarianRole,
      farmId: aurora.id,
    },
    {
      name: "Zootecnista",
      email: "zoot@cowhealth.com",
      roleModel: zootecnistaRole,
      farmId: boaEsperanca.id,
    },
    {
      name: "Gerente de Fazenda",
      email: "gerente@cowhealth.com",
      roleModel: gerenteFazendaRole,
      farmId: aurora.id,
    },
    {
      name: "Operador de Campo",
      email: "operador@cowhealth.com",
      roleModel: operadorRole,
      farmId: aurora.id,
    },
    {
      name: "Financeiro",
      email: "financeiro@cowhealth.com",
      roleModel: financeiroRole,
      farmId: aurora.id,
    },
    {
      name: "Observador",
      email: "obs@cowhealth.com",
      roleModel: observadorRole,
      farmId: santaClara.id,
    },
  ];

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const createdUsers = await Promise.all(
    userData.map(({ name, email, roleModel, farmId }) =>
      prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          name,
          email,
          passwordHash,
          active: true,
          farmId,
          roles: { create: [{ roleId: roleModel.id }] },
        },
      }),
    ),
  );

  console.log(`${createdUsers.length} usuários criados`);

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
      name: `STCK${String(i + 1).padStart(4, "0")}`,
      status: CollarStatus.INACTIVE,
      dataFrequency: DataFrequency.DEFAULT,
    })),
    ...Array.from({ length: 10 }, (_, i) => ({
      name: `MANT${String(i + 1).padStart(4, "0")}`,
      status: CollarStatus.MAINTENANCE,
      dataFrequency: DataFrequency.DEFAULT,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
      name: `INAC${String(i + 1).padStart(4, "0")}`,
      status: CollarStatus.INACTIVE,
      dataFrequency: DataFrequency.LOWER,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
      name: `BATT${String(i + 1).padStart(4, "0")}`,
      status: CollarStatus.BATTERY,
      dataFrequency: DataFrequency.LOWER,
    })),
  ];

  const createdCollars = await Promise.all(
    collarData.map((collar) =>
      prisma.collar.upsert({
        where: { name: collar.name },
        update: {},
        create: collar,
      }),
    ),
  );

  console.log(`${createdCollars.length} colares criados`);

  // Vacas — 160 total (32 por fazenda)
  console.log("Criando vacas (160) e vinculando colares às fazendas...");

  const COWS_PER_FARM = 32;
  let statusIndex = 0;
  let collarIndex = 0;
  const createdCows = [];

  for (let farmIndex = 0; farmIndex < createdFarms.length; farmIndex++) {
    const farm = createdFarms[farmIndex];

    for (let cowIndex = 0; cowIndex < COWS_PER_FARM; cowIndex++) {
      const globalIndex = farmIndex * COWS_PER_FARM + cowIndex;
      const status = SHUFFLED_STATUSES[statusIndex++];
      const tag = `BR-${String(globalIndex + 1).padStart(3, "0")}`;
      const name = COW_NAMES[cowIndex % COW_NAMES.length];
      const breed = BREEDS[globalIndex % BREEDS.length];
      const weight = Math.round(randomBetween(380, 580));

      // Vincula colar ACTIVE (os 160 primeiros colares)
      const collar = createdCollars[collarIndex++];

      // ATUALIZAÇÃO: Vincula o colar à fazenda também
      await prisma.collar.update({
        where: { id: collar.id },
        data: { farmId: farm.id },
      });

      const cow = await prisma.cow.upsert({
        where: { tag },
        update: {},
        create: {
          tag,
          name,
          breed,
          weight,
          status,
          farmId: farm.id,
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
    const heartRateRecords = [];
    const temperatureRecords = [];
    const accelerometerRecords = [];
    const isRecentAlert = true; // todas as vacas têm dados completos

    for (let hoursAgo = HOURS_OF_DATA; hoursAgo >= 0; hoursAgo--) {
      const measuredAt = dateHoursAgo(hoursAgo);
      const isAlertWindow = hoursAgo <= 6;

      let bpm: number, celsius: number;
      let accelX: number, accelY: number, accelZ: number;
      let gyroX: number, gyroY: number, gyroZ: number;

      if (scenario === CowStatus.HEAT_STRESS && isAlertWindow) {
        bpm = Math.round(randomBetween(102, 118));
        celsius = parseFloat(randomBetween(39.2, 40.1).toFixed(1));
        accelX = parseFloat(randomBetween(0.9, 1.8).toFixed(3));
        accelY = parseFloat(randomBetween(0.9, 1.8).toFixed(3));
        accelZ = parseFloat(randomBetween(8.5, 10.5).toFixed(3));
        gyroX = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
        gyroY = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
        gyroZ = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
      } else if (scenario === CowStatus.CALVING && isAlertWindow) {
        const tempBase = 38.8 - hoursAgo * 0.05;
        bpm = Math.round(randomBetween(92, 108));
        celsius = parseFloat(
          Math.min(Math.max(tempBase + randomBetween(-0.2, 0.2), 37.5), 39.0).toFixed(1),
        );
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

      heartRateRecords.push({ cowId: cow.id, bpm, measuredAt });
      temperatureRecords.push({ cowId: cow.id, celsius, measuredAt });
      accelerometerRecords.push({
        cowId: cow.id,
        accelX,
        accelY,
        accelZ,
        gyroX,
        gyroY,
        gyroZ,
        measuredAt,
      });
    }

    await prisma.heartRateData.createMany({ data: heartRateRecords });
    await prisma.temperatureData.createMany({ data: temperatureRecords });
    await prisma.accelerometerData.createMany({ data: accelerometerRecords });
  }

  console.log("Dados de sensores criados");

  // Notificações de exemplo
  console.log("Criando notificações...");
  const adminUser = createdUsers[0];
  const heatStressCows = createdCows
    .filter(({ scenario }) => scenario === CowStatus.HEAT_STRESS)
    .slice(0, 2);
  const calvingCows = createdCows
    .filter(({ scenario }) => scenario === CowStatus.CALVING)
    .slice(0, 2);
  const alertCows = createdCows.filter(({ scenario }) => scenario === CowStatus.ALERT).slice(0, 1);

  const notificationsData = [
    ...heatStressCows.map(({ cow }) => ({
      userId: adminUser.id,
      cowId: cow.id,
      title: "Alerta: Estresse térmico detectado",
      message: `A vaca ${cow.name} (${cow.tag}) apresenta temperatura média elevada e FC acima do normal nas últimas 6 horas.`,
    })),
    ...calvingCows.map(({ cow }) => ({
      userId: adminUser.id,
      cowId: cow.id,
      title: "Alerta: Parto iminente detectado",
      message: `A vaca ${cow.name} (${cow.tag}) apresenta padrão de movimentação postural intensa e queda progressiva de temperatura.`,
    })),
    ...alertCows.map(({ cow }) => ({
      userId: adminUser.id,
      cowId: cow.id,
      title: "Alerta: Parâmetros fora do normal",
      message: `A vaca ${cow.name} (${cow.tag}) apresentou parâmetros fora do intervalo esperado. Avaliação recomendada.`,
      readAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    })),
  ];

  await prisma.notification.createMany({ data: notificationsData });

  // ── Prontuários médicos ────────────────────────────────────────────────────
  console.log("Criando prontuários médicos...");

  const vetUser  = createdUsers[2]; // vet@cowhealth.com
  const zootUser = createdUsers[3]; // zoot@cowhealth.com

  const CHECKUP_TITLES = [
    "Check-up geral",
    "Exame clínico rotineiro",
    "Avaliação de saúde semestral",
    "Monitoramento de peso e condição corporal",
    "Check-up pré-reprodutivo",
  ];

  const PROCEDURE_TITLES = [
    "Vacinação contra febre aftosa",
    "Casqueamento preventivo",
    "Coleta de sangue para exames laboratoriais",
    "Tratamento de mastite subclínica",
    "Aplicação de vitaminas ADE",
  ];

  const MEDICATION_TITLES = [
    "Aplicação de antibiótico (Oxitetraciclina)",
    "Anti-inflamatório (Flunixina Meglumina)",
    "Suplementação com BoviMin",
    "Antiparasitário (Ivermectina)",
    "Reposição hídrica e eletrolítica",
  ];

  // PRNG determinístico por vaca para dados reproduzíveis entre execuções
  const makeRand = (seed: number) => {
    let s = seed;
    return () => {
      s = Math.imul(s, 1664525) + 1013904223;
      return (s >>> 0) / 0xffffffff;
    };
  };

  const daysAgo = (days: number) =>
    new Date(Date.now() - Math.round(days) * 24 * 60 * 60 * 1000);

  const pick = <T>(arr: T[], r: number): T => arr[Math.floor(r * arr.length) % arr.length];

  type MedicalRecordRow = {
    cowId:      number;
    userId:     number;
    type:       "CHECKUP" | "PROCEDURE" | "MEDICATION";
    title:      string;
    notes:      string | null;
    recordedAt: Date;
  };

  const medicalRecordsData: MedicalRecordRow[] = [];

  for (const { cow, scenario } of createdCows) {
    const rand = makeRand(cow.id * 31 + 7);

    // ── Todos os animais recebem 1-2 check-ups nos últimos 90 dias ──
    const checkupCount = rand() > 0.45 ? 2 : 1;
    for (let i = 0; i < checkupCount; i++) {
      medicalRecordsData.push({
        cowId:      cow.id,
        userId:     rand() > 0.4 ? vetUser.id : zootUser.id,
        type:       "CHECKUP",
        title:      pick(CHECKUP_TITLES, rand()),
        notes:      scenario === CowStatus.HEALTHY
          ? "Animal em bom estado geral. Sem alterações clínicas relevantes. Escore de condição corporal dentro do esperado."
          : "Exame de rotina realizado. Aguardando resultados para definir conduta.",
        recordedAt: daysAgo(rand() * 80 + 8),
      });
    }

    // ── Vacas em estresse térmico: medicação recente + procedimento de suporte ──
    if (scenario === CowStatus.HEAT_STRESS) {
      medicalRecordsData.push({
        cowId:      cow.id,
        userId:     vetUser.id,
        type:       "MEDICATION",
        title:      "Anti-inflamatório (Flunixina Meglumina)",
        notes:      "Animal apresentou temperatura retal acima de 39,5 °C e FC elevada nas últimas 6 h. Prescrito anti-inflamatório IV. Recomendado acesso irrestrito a sombra e água fresca.",
        recordedAt: daysAgo(rand() * 8 + 1),
      });
      if (rand() > 0.35) {
        medicalRecordsData.push({
          cowId:      cow.id,
          userId:     vetUser.id,
          type:       "PROCEDURE",
          title:      "Aplicação de vitaminas ADE",
          notes:      "Suplementação vitamínica para reforçar imunidade durante período de estresse térmico.",
          recordedAt: daysAgo(rand() * 20 + 9),
        });
      }
    }

    // ── Vacas em alerta: coleta + antibiótico ──
    if (scenario === CowStatus.ALERT) {
      medicalRecordsData.push({
        cowId:      cow.id,
        userId:     vetUser.id,
        type:       "PROCEDURE",
        title:      pick(PROCEDURE_TITLES, rand()),
        notes:      "Procedimento realizado após alertas do sistema indicarem parâmetros fisiológicos fora do intervalo normal. Monitoramento contínuo ativado.",
        recordedAt: daysAgo(rand() * 6 + 1),
      });
      medicalRecordsData.push({
        cowId:      cow.id,
        userId:     vetUser.id,
        type:       "MEDICATION",
        title:      pick(MEDICATION_TITLES, rand()),
        notes:      "Tratamento iniciado após exame físico. Reavaliação agendada em 72 h.",
        recordedAt: daysAgo(rand() * 4 + 1),
      });
    }

    // ── Vacas em parição: acompanhamento pré e pós-parto ──
    if (scenario === CowStatus.CALVING) {
      medicalRecordsData.push({
        cowId:      cow.id,
        userId:     vetUser.id,
        type:       "CHECKUP",
        title:      "Monitoramento pós-parto",
        notes:      "Avaliação pós-parto. Animal estável. Colostro produzido normalmente. Involução uterina em curso. Bezerro com bom reflexo de sucção.",
        recordedAt: daysAgo(rand() * 4 + 1),
      });
      medicalRecordsData.push({
        cowId:      cow.id,
        userId:     vetUser.id,
        type:       "PROCEDURE",
        title:      "Vacinação contra febre aftosa",
        notes:      "Vacinação de rotina realizada no período periparto. Bezerro também imunizado.",
        recordedAt: daysAgo(rand() * 12 + 5),
      });
      if (rand() > 0.5) {
        medicalRecordsData.push({
          cowId:      cow.id,
          userId:     vetUser.id,
          type:       "MEDICATION",
          title:      "Ocitocina pós-parto",
          notes:      "Aplicação para estimular contração uterina e auxiliar na expulsão da placenta.",
          recordedAt: daysAgo(rand() * 3 + 1),
        });
      }
    }
  }

  await prisma.medicalRecord.createMany({ data: medicalRecordsData });
  console.log(`${medicalRecordsData.length} prontuários médicos criados`);

  // ─── Campos reprodutivos + ClinicalRecords + ActivityEvents ───────────────
  console.log("Criando dados clínicos e de atividade...");

  const REPRO_STATUSES: ReproductiveStatus[] = ["OPEN", "INSEMINATED", "PREGNANT", "DRY", "POSTPARTUM"];
  const CLINICAL_STATUSES_LIST: ClinicalStatus[] = ["STABLE", "MONITORING", "CRITICAL", "RECOVERED"];
  const ACTIVITY_TYPES: ActivityType[] = ["RUMINATION", "FEEDING", "RESTING", "LOW_ACTIVITY", "HIGH_ACTIVITY", "WALKING"];

  const DIAGNOSES = [
    "Mamite subclínica — tratamento local iniciado.",
    "Timpanismo gasoso leve — desobstrução realizada, dieta ajustada.",
    "Estresse térmico — recomendado sombreamento e hidratação reforçada.",
    "Animal saudável sem alterações clínicas no momento do exame.",
    "Laminite grau 1 — cascos tratados, anti-inflamatório prescrito.",
  ];

  const TREATMENT_PLANS = [
    "Penicilina G 22.000 UI/kg IM por 5 dias. Reavaliação em 72 h.",
    "Flunixina 2,2 mg/kg IV dose única. Monitorar temperatura 2×/dia.",
    "Reposição hídrica oral, eletrólitos, sombra irrestrita.",
    "Sem tratamento necessário. Retorno em 30 dias para check-up.",
    "Cura de cascos + sulfato de cobre tópico. Pastagem firme.",
  ];

  const VACCINATION_RECORDS = [
    "Aftosa (12/2025) · Brucelose negativa (10/2025) · Raiva (08/2025)",
    "Aftosa (01/2026) · IBR/BVD (11/2025) · Clostridioses (09/2025)",
    "Aftosa (12/2025) · Carbúnculo (10/2025) · Leptospirose (08/2025)",
    "Protocolo completo em dia. Próximo reforço: Aftosa 06/2026.",
    "Sem histórico registrado — animal recém-adquirido.",
  ];

  let clinicalRecordCount = 0;
  let activityEventCount = 0;

  for (const { cow, scenario } of createdCows) {
    const rand = makeRand(cow.id * 53 + 17);

    // ── Status reprodutivo por cenário ──────────────────────────────────────
    const isCalving    = scenario === CowStatus.CALVING;
    const isHeatStress = scenario === CowStatus.HEAT_STRESS;
    const isAlert      = scenario === CowStatus.ALERT;

    const reproStatus = isCalving    ? "POSTPARTUM"
                      : isHeatStress ? pick(["OPEN", "INSEMINATED", "DRY"] as ReproductiveStatus[], rand())
                      : isAlert      ? pick(["OPEN", "INSEMINATED"] as ReproductiveStatus[], rand())
                      :                pick(REPRO_STATUSES, rand());

    const lastCalvingDate = (reproStatus === "POSTPARTUM" || reproStatus === "DRY")
      ? daysAgo(rand() * 120 + 30)
      : reproStatus === "PREGNANT"
        ? daysAgo(rand() * 200 + 90)
        : undefined;

    const expectedCalvingDate = reproStatus === "PREGNANT"
      ? new Date(Date.now() + (rand() * 180 + 30) * 24 * 60 * 60 * 1000)
      : undefined;

    const lactationNumber = lastCalvingDate ? Math.floor(rand() * 4) + 1 : undefined;

    await prisma.cow.update({
      where: { id: cow.id },
      data: {
        reproductiveStatus: reproStatus,
        lastCalvingDate,
        expectedCalvingDate,
        lactationNumber,
        sire: rand() > 0.5 ? pick(["Touro Supremo", "Angus Elite", "Holstein Pride", "Nelore Campeão"], rand()) : undefined,
      },
    });

    // ── 2–3 CowClinicalRecords por vaca ─────────────────────────────────────
    const recordCount = rand() > 0.4 ? 3 : 2;
    for (let i = 0; i < recordCount; i++) {
      const isRecent  = i === 0;
      const daysBack  = isRecent ? rand() * 20 + 2 : rand() * 80 + 25;

      const clinicalStatus = isAlert      ? "MONITORING"
                           : isHeatStress && isRecent ? "CRITICAL"
                           : isCalving    ? (isRecent ? "STABLE" : "MONITORING")
                           :                pick(CLINICAL_STATUSES_LIST, rand());

      const diagIdx = Math.floor(rand() * DIAGNOSES.length);

      await prisma.cowClinicalRecord.create({
        data: {
          cowId:                cow.id,
          veterinarianId:       vetUser.id,
          recordDate:           daysAgo(daysBack),
          clinicalStatus,
          alertOrigin:          isAlert || isHeatStress ? "sensor" : rand() > 0.6 ? "visual" : "scheduled",
          heartRate:            Math.round(60 + rand() * 30),
          spo2:                 parseFloat((95 + rand() * 4).toFixed(1)),
          bodyTemperature:      parseFloat((38.2 + rand() * 1.8).toFixed(1)),
          ambientTemperature:   parseFloat((22 + rand() * 12).toFixed(1)),
          activityLevel:        pick(["Normal", "Baixa", "Alta"], rand()),
          weight:               parseFloat((450 + rand() * 200).toFixed(1)),
          bodyConditionScore:   parseFloat((2.5 + rand() * 2).toFixed(1)),
          currentSymptoms:      isAlert      ? "Hipertermia, redução de apetite, isolamento do rebanho."
                               : isHeatStress ? "Taquipneia, sudorese excessiva, tremores musculares."
                               : isCalving    ? "Sinais de involução uterina normal, lóquios sem odor."
                               :               "Sem queixas no momento.",
          diagnosis:            DIAGNOSES[diagIdx],
          treatmentPlan:        TREATMENT_PLANS[diagIdx],
          medicationsAdministered: isAlert || isHeatStress
            ? "Flunixina Meglumina 500 mg IV. Solução salina 0,9% 5L IV."
            : rand() > 0.5
              ? "Complexo vitamínico ADE IM."
              : null,
          vaccinationHistory:   pick(VACCINATION_RECORDS, rand()),
          reproductiveStatus:   reproStatus,
          pregnancyStatus:      reproStatus === "PREGNANT",
          lastCalvingDate,
          expectedCalvingDate,
          followUpRequired:     isAlert || isHeatStress || clinicalStatus === "MONITORING",
          followUpDate:         (isAlert || isHeatStress) ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : undefined,
          generalNotes:         i === 0 ? "Atendimento registrado via sistema CowHealth AI." : null,
        },
      });
      clinicalRecordCount++;
    }

    // ── 3–5 ActivityEvents por vaca ─────────────────────────────────────────
    const eventCount = Math.floor(rand() * 3) + 3;
    const activityData = Array.from({ length: eventCount }, (_, i) => ({
      cowId:       cow.id,
      type:        pick(ACTIVITY_TYPES, rand()),
      startedAt:   daysAgo(rand() * 3 + i * 0.2),
      durationMin: Math.round(rand() * 90 + 15),
    }));

    await prisma.activityEvent.createMany({ data: activityData });
    activityEventCount += eventCount;
  }

  console.log(`${clinicalRecordCount} prontuários clínicos criados`);
  console.log(`${activityEventCount} eventos de atividade criados`);

  // Vínculos usuário-fazenda
  // Apenas SuperAdmin tem acesso irrestrito (farmIds: null no JWT — sem registro em UserFarm)
  // Administrador e todos os demais perfis são limitados às fazendas vinculadas
  console.log("Criando vínculos usuário-fazenda...");

  const [
    _superAdminUser,   // admin@cowhealth.com          — irrestrito (SuperAdmin)
    adminAurora,       // administrador@aurora.com
    adminSaoBento,     // administrador@saobento.com
    adminBoaEsperanca, // administrador@boaesperanca.com
    adminSantaClara,   // administrador@santaclara.com
    adminValeVerde,    // administrador@valeverde.com
    vetUserFarm,       // vet@cowhealth.com
    zootUserFarm,      // zoot@cowhealth.com
    gerenteUser,       // gerente@cowhealth.com
    operadorUser,      // operador@cowhealth.com
    financeiroUser,    // financeiro@cowhealth.com
    observadorUser,    // obs@cowhealth.com
  ] = createdUsers;

  const userFarmData = [
    // Cada administrador gerencia apenas a sua fazenda
    { userId: adminAurora.id,  farmId: aurora.id },
    { userId: adminSaoBento.id,  farmId: saoBento.id },
    { userId: adminBoaEsperanca.id,  farmId: boaEsperanca.id },
    { userId: adminSantaClara.id,  farmId: santaClara.id },
    { userId: adminValeVerde.id,  farmId: valeVerde.id },
    // Veterinário atende 2 fazendas em uma região
    { userId: vetUserFarm.id,    farmId: aurora.id },
    { userId: vetUserFarm.id,    farmId: saoBento.id },
    // Zootecnista em 1 fazenda
    { userId: zootUserFarm.id,   farmId: boaEsperanca.id },
    // Gerente responsável pela sua fazenda
    { userId: gerenteUser.id,    farmId: aurora.id },
    // Operador de campo em 1 fazenda
    { userId: operadorUser.id,   farmId: aurora.id },
    // Financeiro vê todas as fazendas para controle de custos
    { userId: financeiroUser.id, farmId: aurora.id },
    { userId: financeiroUser.id, farmId: saoBento.id },
    { userId: financeiroUser.id, farmId: boaEsperanca.id },
    { userId: financeiroUser.id, farmId: santaClara.id },
    { userId: financeiroUser.id, farmId: valeVerde.id },
    // Observador em 1 fazenda
    { userId: observadorUser.id, farmId: santaClara.id },
  ];

  await prisma.userFarm.createMany({ data: userFarmData, skipDuplicates: true });
  console.log(`\n${userFarmData.length} vínculos usuário-fazenda criados`);
  console.log("  Vínculos:");
  console.log("  admin@cowhealth.com              → irrestrito (SuperAdmin)");
  console.log("  administrador@aurora.com         → Fazenda Aurora");
  console.log("  administrador@saobento.com       → Fazenda Sao Bento");
  console.log("  administrador@boaesperanca.com   → Fazenda Boa Esperanca");
  console.log("  administrador@santaclara.com     → Fazenda Santa Clara");
  console.log("  administrador@valeverde.com      → Fazenda Vale Verde");
  console.log("  vet@cowhealth.com                → Fazenda Aurora, Fazenda Sao Bento");
  console.log("  zoot@cowhealth.com               → Fazenda Boa Esperanca");
  console.log("  gerente@cowhealth.com            → Fazenda Aurora");
  console.log("  operador@cowhealth.com           → Fazenda Aurora");
  console.log("  financeiro@cowhealth.com         → Todas as fazendas");
  console.log("  obs@cowhealth.com                → Fazenda Santa Clara");

  console.log("\nSeed concluído com sucesso.");
  console.log("---");
  console.log("Credenciais (senha: 12345678):");
  console.log("  admin@cowhealth.com            SuperAdmin");
  console.log("  administrador@aurora.com       Administrador");
  console.log("  administrador@saobento.com     Administrador");
  console.log("  administrador@boaesperanca.com Administrador");
  console.log("  administrador@santaclara.com   Administrador");
  console.log("  administrador@valeverde.com    Administrador");
  console.log("  vet@cowhealth.com              Veterinario");
  console.log("  zoot@cowhealth.com             Zootecnista");
  console.log("  gerente@cowhealth.com          Gerente de Fazenda");
  console.log("  operador@cowhealth.com         Operador de Campo");
  console.log("  financeiro@cowhealth.com       Financeiro");
  console.log("  obs@cowhealth.com              Observador");
  console.log("\nNovas permissões: MedicalRecord (5) + ClinicalRecord (5) + Retire Cow (1)");
  console.log("Dados novos: CowClinicalRecord · ActivityEvent · campos reprodutivos em Cow");
}

main()
  .catch((error) => {
    console.error("Erro no seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
