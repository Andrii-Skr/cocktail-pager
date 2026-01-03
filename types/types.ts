// types.ts (или прямо в OrderCard)
import type { Prisma } from "@prisma/client"

export type OrderWithCocktail = Prisma.OrderGetPayload<{
  include: { cocktail: true; user: true } // ← добавили user
}>
