import { prisma } from "./src/lib/prisma";

async function checkVetFarms() {
  console.log("\n🔍 === VERIFICANDO ACESSO DO VETERINÁRIO === \n");

  const vet = await prisma.user.findUnique({
    where: { email: "vet@cowhealth.com" },
  });

  if (!vet) {
    console.log("❌ Veterinário não encontrado!");
    await prisma.$disconnect();
    return;
  }

  console.log(`👤 Usuário: ${vet.name}`);
  console.log(`📧 Email: ${vet.email}`);
  console.log(`✅ Ativo: ${vet.active}`);

  // Get farms vinculadas
  const farmUsers = await prisma.farmUser.findMany({
    where: { userId: vet.id },
    include: { farm: true },
  });

  console.log(`\n🏠 Fazendas Vinculadas: ${farmUsers.length}`);
  if (farmUsers.length > 0) {
    farmUsers.forEach((fu, i) => {
      console.log(`   ${i + 1}. ${fu.farm.name} (ID: ${fu.farm.id})`);
    });
  } else {
    console.log("   Nenhuma fazenda vinculada");
  }

  console.log("\n");
  await prisma.$disconnect();
}

checkVetFarms().catch((e) => {
  console.error("❌ Erro:", e);
  process.exit(1);
});
