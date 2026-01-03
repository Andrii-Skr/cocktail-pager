import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

export async function seed() {
  await db.$transaction([
    // 1. чистим нужные таблицы (в нужном порядке при связях)
    db.order.deleteMany(),
    db.cocktail.deleteMany(),
    // если есть зависимости, удаляйте дочерние таблицы раньше родительских
    // db.order.deleteMany(),
    // db.user.deleteMany(),
  ])

  // 2. заполняем свежими данными
  const result = await db.cocktail.createMany({
    data: [
      {
        name: "B-52",
        descriptionRu:
          "Вкуснейший напиток, принадлежащий семейству пус-кафе (pousse café). В его состав входят ликеры трех видов: кофейный, сливочный и крепкий апельсиновый",
        descriptionUk:
          "Смачний напій із сімейства пус-кафе (pousse cafe). До складу входять три види лікерів: кавовий, вершковий і міцний апельсиновий",
        descriptionEn:
          "A delicious drink from the pousse cafe family. It contains three kinds of liqueurs: coffee, cream, and strong orange.",
        imageUrl: "/img/b52.jpg",
      },
      {
        name: "Mojito",
        descriptionRu:
          "Это кубинский коктейль, который обычно состоит из белого рома, сахара, лайма, мяты и газированной воды",
        descriptionUk:
          "Це кубинський коктейль, який зазвичай складається з білого рому, цукру, лайма, м'яти та газованої води",
        descriptionEn:
          "A Cuban cocktail usually made with white rum, sugar, lime, mint, and soda water.",
        imageUrl: "/img/mojito.jpg",
      },
      {
        name: "Tequila Sunrise",
        descriptionRu:
          "Это слабоалкогольный цитрусовый лонг на основе текилы с добавлением гренадина и апельсинового сока. Простой, но очень вкусный и красивый: переходящий в оранжевый цвет красный гренадин действительно напоминает восходящее солнце.",
        descriptionUk:
          "Це слабоалкогольний цитрусовий лонг на основі текіли з додаванням гренадину та апельсинового соку. Простий, але дуже смачний і красивий: червоний гренадин, що переходить в оранжевий колір, справді нагадує схід сонця.",
        descriptionEn:
          "A low-alcohol citrus long drink based on tequila with grenadine and orange juice. Simple, tasty, and beautiful: the red grenadine fading into orange really resembles a sunrise.",
        imageUrl: "/img/tekila-sanraiz.webp",
      },
      {
        name: "Long Island Iced Tea",
        descriptionRu:
          "Коктейль на основе водки, джина, текилы и рома, плюс трипл-сек и кола. Один из самых крепких лонгов — около 22 °.",
        descriptionUk:
          "Коктейль на основі горілки, джину, текіли та рому, плюс трипл-сек і кола. Один із найміцніших лонгів — близько 22 °.",
        descriptionEn:
          "A cocktail based on vodka, gin, tequila, and rum, plus triple sec and cola. One of the strongest long drinks—about 22°.",
        imageUrl: "/img/long-island.jpg",
      },
      {
        name: "Margarita",
        descriptionRu:
          "Алкогольный коктейль на основе текилы с ликером и соком лайма.",
        descriptionUk:
          "Алкогольний коктейль на основі текіли з лікером та соком лайма.",
        descriptionEn:
          "An alcoholic cocktail based on tequila with liqueur and lime juice.",
        imageUrl: "/img/margarita.jpg",
      },
      {
        name: "Whisky Cola",
        descriptionRu:
          "Это простой алкогольный коктейль, состоящий из виски и кока-колы. Он характеризуется сладким вкусом газировки и нотками виски.",
        descriptionUk:
          "Це простий алкогольний коктейль, що складається з віскі та кока-коли. Він має солодкий смак газованого напою та нотки віскі.",
        descriptionEn:
          "A simple alcoholic cocktail made of whisky and cola. It has the sweet taste of soda with notes of whisky.",
        imageUrl: "/img/whisky-cola.jpg",
      },
      {
        name: "Gin & Tonic",
        descriptionRu:
          "Это коктейль, который состоит из джина и тоника, обычно с добавлением лайма или лимона и льда",
        descriptionUk:
          "Це коктейль, який складається з джину та тоніка, зазвичай з додаванням лайма або лимона та льоду",
        descriptionEn:
          "A cocktail made of gin and tonic, usually with lime or lemon and ice",
        imageUrl: "/img/gin-tonic.webp",
      },
    ],
    // если хотите пропускать дубликаты по уникальным полям:
    // skipDuplicates: true,
  })

  console.log(`✅ Seed завершён: добавлено ${result.count} коктейлей`)
}

seed()
  .catch((e) => {
    console.error("❌ Ошибка сидирования:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
