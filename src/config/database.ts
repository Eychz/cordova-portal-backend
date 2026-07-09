import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query' as any, (e: any) => {
  console.log(`[PRISMA QUERY] Query: ${e.query}`);
  console.log(`[PRISMA QUERY] Params: ${e.params}`);
  console.log(`[PRISMA QUERY] Duration: ${e.duration}ms`);
});

export default prisma;
