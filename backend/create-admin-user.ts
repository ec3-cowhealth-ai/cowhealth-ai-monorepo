import { prisma } from "./src/lib/prisma";

async function createAdminWithNotificationPermission() {
  console.log("🔧 Criando usuário admin com permissão de notificações...\n");

  // 1. Encontrar ou criar a permissão "ViewAny Notification"
  let permission = await prisma.permission.findUnique({
    where: { name: "ViewAny Notification" },
  });

  if (!permission) {
    console.log("📌 Criando permissão 'ViewAny Notification'...");
    permission = await prisma.permission.create({
      data: { name: "ViewAny Notification" },
    });
    console.log("✅ Permissão criada\n");
  } else {
    console.log("✅ Permissão já existe\n");
  }

  // 2. Encontrar ou criar a role "Admin"
  let role = await prisma.role.findUnique({
    where: { name: "Admin" },
  });

  if (!role) {
    console.log("📌 Criando role 'Admin'...");
    role = await prisma.role.create({
      data: {
        name: "Admin",
        permissions: {
          create: {
            permissionId: permission.id,
          },
        },
      },
      include: { permissions: true },
    });
    console.log("✅ Role 'Admin' criada\n");
  } else {
    // Garantir que a role tem a permissão
    const hasPermission = await prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
    });

    if (!hasPermission) {
      console.log("📌 Adicionando permissão à role 'Admin'...");
      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: permission.id },
      });
      console.log("✅ Permissão adicionada\n");
    } else {
      console.log("✅ Role já possui a permissão\n");
    }
  }

  // 3. Verificar se usuário admin existe
  let user = await prisma.user.findFirst({
    where: { email: "admin@cowhealth.com" },
    include: { roles: true },
  });

  if (user) {
    console.log("✅ Usuário admin já existe\n");

    // Garantir que tem a role
    const hasRole = user.roles.some((r) => r.id === role.id);
    if (!hasRole) {
      console.log("📌 Adicionando role ao usuário...");
      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id },
      });
      console.log("✅ Role adicionada\n");
    }
  } else {
    console.log("📌 Criando usuário admin...");
    user = await prisma.user.create({
      data: {
        email: "admin@cowhealth.com",
        name: "Administrador",
        active: true,
        roles: {
          create: {
            roleId: role.id,
          },
        },
      },
      include: { roles: true },
    });
    console.log("✅ Usuário criado\n");
  }

  console.log("═══════════════════════════════════════════════════════");
  console.log("✅ SETUP CONCLUÍDO!");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`\n📧 Email: ${user.email}`);
  console.log(`📝 Nome: ${user.name}`);
  console.log(`✅ Ativo: ${user.active}`);
  console.log(`🔐 Roles: ${user.roles.map((r) => r.name).join(", ")}`);
  console.log(`\n✨ Agora as notificações serão criadas automaticamente!`);
  console.log(`\n⏳ Os alertas devem aparecer no dashboard em breve...`);

  await prisma.$disconnect();
}

createAdminWithNotificationPermission().catch((e) => {
  console.error("❌ Erro:", e);
  process.exit(1);
});
