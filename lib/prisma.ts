// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined
}

const prismaClientInstance = globalThis.prismaClient ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaClient = prismaClientInstance
}

export const prisma = prismaClientInstance
