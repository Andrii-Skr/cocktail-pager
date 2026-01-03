// app/api/cocktails/route.ts
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { defaultLocale, type Locale, locales } from "@/i18n/routing"
import { prisma } from "@/lib/prisma"

/** GET /api/cocktails  — вернёт все напитки */
export async function GET(req: NextRequest) {
  const localeParam = req.nextUrl.searchParams.get("locale")
  const locale = locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : defaultLocale

  const cocktails = await prisma.cocktail.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      descriptionRu: true,
      descriptionUk: true,
      descriptionEn: true,
    },
  })

  const data = cocktails.map(
    ({ descriptionRu, descriptionUk, descriptionEn, ...rest }) => ({
      ...rest,
      description:
        locale === "uk"
          ? descriptionUk
          : locale === "en"
            ? descriptionEn
            : descriptionRu,
    })
  )

  return NextResponse.json(data)
}
