import { PrismaClient, CowStatus, CollarStatus, DataFrequency } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

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

const cowData = [
	{ tag: "BR-001", name: "Mimosa",   breed: "Nelore",    weight: 480, status: CowStatus.HEALTHY,     collarIndex: 0,    farmIndex: 0 },
	{ tag: "BR-002", name: "Bonita",   breed: "Gir",       weight: 420, status: CowStatus.ALERT,       collarIndex: 1,    farmIndex: 0 },
	{ tag: "BR-003", name: "Estrela",  breed: "Holandesa", weight: 550, status: CowStatus.HEALTHY,     collarIndex: 2,    farmIndex: 1 },
	{ tag: "BR-004", name: "Clarinha", breed: "Nelore",    weight: 460, status: CowStatus.HEAT_STRESS, collarIndex: null, farmIndex: 1 },
	{ tag: "BR-005", name: "Morena",   breed: "Angus",     weight: 510, status: CowStatus.CALVING,     collarIndex: null, farmIndex: 2 },
];

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const dateHoursAgo  = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

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

	// Grupos
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

	// Usuario admin
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

	// Dados de sensores (1 semana, 1 leitura por hora)
	console.log("Criando dados de sensores...");
	const HOURS_OF_DATA  = 168;
	const cowsWithCollar = createdCows.filter((_, index) => cowData[index].collarIndex !== null);

	for (const cow of cowsWithCollar) {
		const heartRateRecords     = [];
		const temperatureRecords   = [];
		const accelerometerRecords = [];

		for (let hoursAgo = HOURS_OF_DATA; hoursAgo >= 0; hoursAgo--) {
		const measuredAt = dateHoursAgo(hoursAgo);

		heartRateRecords.push({ cowId: cow.id, bpm: Math.round(randomBetween(55, 95)), measuredAt });

		temperatureRecords.push({ cowId: cow.id, celsius: parseFloat(randomBetween(37.5, 39.5).toFixed(1)), measuredAt });

		accelerometerRecords.push({
			cowId:  cow.id,
			accelX: parseFloat(randomBetween(-1.5, 1.5).toFixed(3)),
			accelY: parseFloat(randomBetween(-1.5, 1.5).toFixed(3)),
			accelZ: parseFloat(randomBetween(8.5, 10.5).toFixed(3)),
			gyroX:  parseFloat(randomBetween(-0.5, 0.5).toFixed(3)),
			gyroY:  parseFloat(randomBetween(-0.5, 0.5).toFixed(3)),
			gyroZ:  parseFloat(randomBetween(-0.5, 0.5).toFixed(3)),
			measuredAt,
		});
		}

		await prisma.heartRateData.createMany({ data: heartRateRecords });
		await prisma.temperatureData.createMany({ data: temperatureRecords });
		await prisma.accelerometerData.createMany({ data: accelerometerRecords });
	}

	console.log(`Dados de sensores criados para ${cowsWithCollar.length} vacas`);

	// Notificacoes
	console.log("Criando notificacoes...");
	await prisma.notification.createMany({
		data: [
		{
			userId:  adminUser.id,
			cowId:   createdCows[1].id,
			title:   "Alerta: Vaca em estado de atencao",
			message: `A vaca ${createdCows[1].name} (${createdCows[1].tag}) apresentou parametros fora do normal.`,
		},
		{
			userId:  adminUser.id,
			cowId:   createdCows[4].id,
			title:   "Alerta: Parto iminente detectado",
			message: `A vaca ${createdCows[4].name} (${createdCows[4].tag}) apresenta sinais de parto iminente.`,
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