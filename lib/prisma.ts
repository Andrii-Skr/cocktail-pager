// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// ✅ 1. Один экземпляр в production
const prisma = new PrismaClient();

// ✅ 2. В dev храним его в глобальной области,
// чтобы при каждом hot-reload не создавался новый клиент
//  ─────────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db =
  process.env.NODE_ENV === "production"
    ? prisma                    // production: тот, что выше
    : (global.prisma ??= prisma); // dev: кешируем на globalThis

// Экспорт под коротким именем, как использовали в примерах:
export { db as prisma };
