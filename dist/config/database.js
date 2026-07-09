"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    log: [
        { level: 'query', emit: 'event' },
        { level: 'info', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
        { level: 'error', emit: 'stdout' },
    ],
});
prisma.$on('query', (e) => {
    console.log(`[PRISMA QUERY] Query: ${e.query}`);
    console.log(`[PRISMA QUERY] Params: ${e.params}`);
    console.log(`[PRISMA QUERY] Duration: ${e.duration}ms`);
});
exports.default = prisma;
