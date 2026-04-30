import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { accountIdentifier: "demo-account-001" },
    update: {},
    create: {
      accountIdentifier: "demo-account-001",
      maskedEmail: "jo***@example.com",
      maskedPhone: "+55******0001"
    }
  });

  const request = await prisma.recoveryRequest.upsert({
    where: { protocolId: "SR-20260430-DEMO01" },
    update: {},
    create: {
      protocolId: "SR-20260430-DEMO01",
      userId: user.id,
      status: "UNDER_REVIEW",
      previousEmailMasked: "jo***@example.com",
      previousPhoneMasked: "+55******0001",
      targetEmailMasked: "no***@example.com",
      targetPhoneMasked: "+55******2222",
      consentAcceptedAt: new Date()
    }
  });

  await prisma.statusHistory.create({
    data: {
      recoveryRequestId: request.id,
      fromStatus: null,
      toStatus: "UNDER_REVIEW",
      reason: "Seed de demonstração",
      actorType: "SYSTEM"
    }
  });

  await prisma.auditEvent.create({
    data: {
      recoveryRequestId: request.id,
      actorType: "SYSTEM",
      action: "SEED_CREATED",
      summary: "Solicitação demonstrativa criada",
      metadata: {}
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
