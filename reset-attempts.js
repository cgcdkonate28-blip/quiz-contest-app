const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.answerDetail.deleteMany({});
  await prisma.attempt.deleteMany({});
  console.log("Toutes les tentatives de test ont ete effacees.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
