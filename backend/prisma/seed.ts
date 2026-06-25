import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding workers...');

  const workers = [
    { code: 'EMP001', name: 'Carlos Martínez' },
    { code: 'EMP002', name: 'Ana García' },
    { code: 'EMP003', name: 'Luis Rodríguez' },
    { code: 'EMP004', name: 'María Fernández' },
    { code: 'EMP005', name: 'Jorge Sánchez' },
  ];

  for (const worker of workers) {
    await prisma.worker.upsert({
      where: { code: worker.code },
      update: {},
      create: {
        code: worker.code,
        name: worker.name,
      },
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
