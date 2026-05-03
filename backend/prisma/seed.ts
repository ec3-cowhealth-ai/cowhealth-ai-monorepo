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

// Dados de exemplo

const farmData = [
	{ name: "Fazenda Aurora",        cnpj: "11.111.111/0001-01", city: "Curitiba", state: "PR", phone: "(41) 99000-0001", email: "aurora@fazenda.com" },
	{ name: "Fazenda Sao Bento",     cnpj: "22.222.222/0001-02", city: "Londrina", state: "PR", phone: "(43) 99000-0002", email: "saobento@fazenda.com" },
	{ name: "Fazenda Boa Esperanca", cnpj: "33.333.333/0001-03", city: "Maringa",  state: "PR", phone: "(44) 99000-0003", email: "boaesperanca@fazenda.com" },
];

const collarData = [
	{ name: "collar-001", status: CollarStatus.ACTIVE,      dataFrequency: DataFrequency.DEFAULT },
	{ name: "collar-002", status: CollarStatus.ACTIVE,      dataFrequency: DataFrequency.HIGHER },
	{ name: "collar-003", status: CollarStatus.ACTIVE,      dataFrequency: DataFrequency.DEFAULT },
	{ name: "collar-004", status: CollarStatus.INACTIVE,    dataFrequency: DataFrequency.DEFAULT },
	{ name: "collar-005", status: CollarStatus.MAINTENANCE, dataFrequency: DataFrequency.LOWER },
];

// collarIndex null = sem colar (sem dados de sensores)
const cowData = [
	{ tag: "BR-001", name: "Mimosa",   breed: "Nelore",    weight: 480, status: CowStatus.HEALTHY,     collarIndex: 0,    farmIndex: 0, scenario: "healthy" },
	{ tag: "BR-002", name: "Bonita",   breed: "Gir",       weight: 420, status: CowStatus.HEAT_STRESS, collarIndex: 1,    farmIndex: 0, scenario: "heat_stress" },
	{ tag: "BR-003", name: "Estrela",  breed: "Holandesa", weight: 550, status: CowStatus.CALVING,     collarIndex: 2,    farmIndex: 1, scenario: "calving" },
	{ tag: "BR-004", name: "Clarinha", breed: "Nelore",    weight: 460, status: CowStatus.HEALTHY,     collarIndex: null, farmIndex: 1, scenario: "none" },
	{ tag: "BR-005", name: "Morena",   breed: "Angus",     weight: 510, status: CowStatus.ALERT,       collarIndex: null, farmIndex: 2, scenario: "none" },
];

// Helpers

const randomBetween = (min: number, max: number) =>
	Math.random() * (max - min) + min;

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

const dateHoursAgo = (hoursAgo: number) =>
	new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

// Gera leituras de sensores hora a hora para um período definido.
// Cada cenário produz dados que refletem o estado clínico da vaca.
const generateSensorReadings = (
	cowId: number,
	totalHours: number,
	scenario: string
	) => {
	const heartRateRecords     = [];
	const temperatureRecords   = [];
	const accelerometerRecords = [];

	for (let hoursAgo = totalHours; hoursAgo >= 0; hoursAgo--) {
		const measuredAt = dateHoursAgo(hoursAgo);
		const isRecentAlert = hoursAgo <= 6; // últimas 6h = janela de alerta para o pitch

		let bpm: number;
		let celsius: number;
		let accelX: number, accelY: number, accelZ: number;
		let gyroX: number,  gyroY: number,  gyroZ: number;

		if (scenario === "heat_stress" && isRecentAlert) {
		// Estresse térmico: temp > 39.0°C + FC > 100 + agitação no acelerômetro
		bpm     = Math.round(randomBetween(102, 118));
		celsius = parseFloat(randomBetween(39.2, 40.1).toFixed(1));
		accelX  = parseFloat(randomBetween(0.9, 1.8).toFixed(3));  // picos acima de 0.8
		accelY  = parseFloat(randomBetween(0.9, 1.8).toFixed(3));
		accelZ  = parseFloat(randomBetween(8.5, 10.5).toFixed(3));
		gyroX   = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
		gyroY   = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
		gyroZ   = parseFloat(randomBetween(-0.8, 0.8).toFixed(3));
		} else if (scenario === "calving" && isRecentAlert) {
		// Parto iminente: FC > 90 + variação postural intensa + queda gradual de temperatura
		const tempBase = 38.8 - (hoursAgo * 0.05); // temperatura cai progressivamente
		bpm     = Math.round(randomBetween(92, 108));
		celsius = parseFloat(clamp(tempBase + randomBetween(-0.2, 0.2), 37.5, 39.0).toFixed(1));
		accelX  = parseFloat(randomBetween(-1.2, 1.2).toFixed(3));
		accelY  = parseFloat(randomBetween(-1.2, 1.2).toFixed(3));
		accelZ  = parseFloat(randomBetween(0.6, 1.4).toFixed(3));  // |Δaccel_z| > 0.5
		gyroX   = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
		gyroY   = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
		gyroZ   = parseFloat(randomBetween(-1.0, 1.0).toFixed(3));
		} else {
		// Dados normais — vaca saudável ou período anterior ao alerta
		bpm     = Math.round(randomBetween(58, 82));
		celsius = parseFloat(randomBetween(37.8, 38.8).toFixed(1));
		accelX  = parseFloat(randomBetween(-0.6, 0.6).toFixed(3));
		accelY  = parseFloat(randomBetween(-0.6, 0.6).toFixed(3));
		accelZ  = parseFloat(randomBetween(9.0, 10.0).toFixed(3));
		gyroX   = parseFloat(randomBetween(-0.3, 0.3).toFixed(3));
		gyroY   = parseFloat(randomBetween(-0.3, 0.3).toFixed(3));
		gyroZ   = parseFloat(randomBetween(-0.3, 0.3).toFixed(3));
		}

		heartRateRecords.push({ cowId, bpm, measuredAt });
		temperatureRecords.push({ cowId, celsius, measuredAt });
		accelerometerRecords.push({ cowId, accelX, accelY, accelZ, gyroX, gyroY, gyroZ, measuredAt });
	}

	return { heartRateRecords, temperatureRecords, accelerometerRecords };
};

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
	const notificationPermissions = createdPermissions.filter((p) => p.name.includes("Notification"));

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

	await prisma.role.upsert({
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

	await prisma.role.upsert({
		where:  { name: "Veterinario" },
		update: {},
		create: {
		name: "Veterinario",
		description: "Acesso aos dados de saúde dos animais e histórico de sensores",
		permissions: {
			create: [
			...farmPermissions.filter((p) => p.name.startsWith("ViewAny") || p.name.startsWith("View")),
			...collarPermissions.filter((p) => p.name.startsWith("ViewAny") || p.name.startsWith("View")),
			...cowPermissions,
			...notificationPermissions,
			].map((p) => ({ permissionId: p.id })),
		},
		},
	});

	await prisma.role.upsert({
		where:  { name: "Produtor" },
		update: {},
		create: {
		name: "Produtor",
		description: "Acesso de leitura ao rebanho e fazendas próprias",
		permissions: {
			create: [
			...farmPermissions.filter((p) => p.name.startsWith("ViewAny") || p.name.startsWith("View")),
			...cowPermissions.filter((p) => p.name.startsWith("ViewAny") || p.name.startsWith("View")),
			...notificationPermissions,
			].map((p) => ({ permissionId: p.id })),
		},
		},
	});

	console.log("Roles criadas: SuperAdmin, Administrador, Veterinario, Produtor");

	// Usuário admin
	console.log("Criando usuario admin...");
	const passwordHash = await bcrypt.hash("admin1234", 12);
	const adminUser = await prisma.user.upsert({
		where:  { email: "admin@admin.com" },
		update: {},
		create: {
		name: "Administrador",
		email: "admin@admin.com",
		passwordHash,
		profile: "ADMIN",
		active: true,
		roles: { create: [{ roleId: superAdminRole.id }] },
		},
	});

	// Fazendas
	console.log("Criando fazendas...");
	const createdFarms = await Promise.all(
		farmData.map((farm) =>
		prisma.farm.upsert({ where: { cnpj: farm.cnpj }, update: {}, create: farm })
		)
	);

	// Colares
	console.log("Criando colares...");
	const createdCollars = await Promise.all(
		collarData.map((collar) =>
		prisma.collar.upsert({ where: { name: collar.name }, update: {}, create: collar })
		)
	);

	// Vacas
	console.log("Criando vacas...");
	const createdCows = await Promise.all(
		cowData.map((cow) =>
		prisma.cow.upsert({
			where:  { tag: cow.tag },
			update: {},
			create: {
			tag:      cow.tag,
			name:     cow.name,
			breed:    cow.breed,
			weight:   cow.weight,
			status:   cow.status,
			farmId:   createdFarms[cow.farmIndex].id,
			collarId: cow.collarIndex !== null ? createdCollars[cow.collarIndex].id : null,
			},
		})
		)
	);

	console.log(`${createdCows.length} vacas criadas`);

	// Dados de sensores: 30 dias de histórico com cenários de alerta nas ultimas 6h
	console.log("Criando dados de sensores (30 dias de historico)...");

	const HOURS_OF_DATA = 24 * 30; // 30 dias

	for (let i = 0; i < cowData.length; i++) {
		const cow      = createdCows[i];
		const cowMeta  = cowData[i];

		if (cowMeta.collarIndex === null) continue;

		const { heartRateRecords, temperatureRecords, accelerometerRecords } =
		generateSensorReadings(cow.id, HOURS_OF_DATA, cowMeta.scenario);

		await prisma.heartRateData.createMany({ data: heartRateRecords });
		await prisma.temperatureData.createMany({ data: temperatureRecords });
		await prisma.accelerometerData.createMany({ data: accelerometerRecords });

		console.log(`  Sensores criados para ${cowMeta.name} (${cowMeta.scenario}) — ${heartRateRecords.length} leituras`);
	}

	// Notificações correspondentes aos cenários de alerta
	console.log("Criando notificacoes de alerta...");

	const bonitaCow  = createdCows.find((_, i) => cowData[i].tag === "BR-002")!;
	const estrtelaCow = createdCows.find((_, i) => cowData[i].tag === "BR-003")!;

	await prisma.notification.createMany({
		data: [
		{
			userId:  adminUser.id,
			cowId:   bonitaCow.id,
			title:   "Alerta: Estresse térmico detectado",
			message: `A vaca Bonita (BR-002) apresenta temperatura média de 39.6°C e FC media de 110 bpm nas últimas 6 horas. Verificar condições de temperatura e hidratação.`,
		},
		{
			userId:  adminUser.id,
			cowId:   estrtelaCow.id,
			title:   "Alerta: Parto iminente detectado",
			message: `A vaca Estrela (BR-003) apresenta padrão de movimentação postural intensa, FC elevada e queda progressiva de temperatura nas últimas 6 horas. Monitorar com atenção.`,
		},
		{
			userId:  adminUser.id,
			cowId:   bonitaCow.id,
			title:   "Alerta: Parâmetros fora do normal",
			message: `Segunda ocorrencia de estresse termico registrada para Bonita (BR-002). Recomenda-se avaliação veterinária.`,
			readAt:  new Date(Date.now() - 2 * 60 * 60 * 1000),
		},
		],
	});

	console.log("Seed concluido com sucesso.");
	console.log("---");
	console.log("Acesso admin: admin@admin.com / admin1234");
}

main()
	.catch((error) => { console.error("Erro no seed:", error); process.exit(1); })
	.finally(async () => { await prisma.$disconnect(); });