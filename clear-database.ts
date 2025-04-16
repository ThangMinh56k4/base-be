import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.message.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("All data has been cleared.");
}

clearDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
