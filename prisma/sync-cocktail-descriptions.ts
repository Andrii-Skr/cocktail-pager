import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  await db.$executeRaw`
    UPDATE "Cocktail"
    SET "descriptionUk" = "descriptionRu",
        "descriptionEn" = "descriptionRu"
  `

  console.log("✅ Cocktail descriptions synced to Russian for uk/en")
}

main()
  .catch((error) => {
    console.error("❌ Failed to sync cocktail descriptions:", error)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
