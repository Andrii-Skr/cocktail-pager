"use client"

import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export function CocktailCard({
  cocktail,
  onOrder,
  disabled = false,
  priority = false,
}: {
  cocktail: { id: number; name: string; description: string; imageUrl: string }
  onOrder: () => void
  disabled?: boolean
  priority?: boolean
}) {
  const t = useTranslations("cocktailCard")
  const locale = useLocale()

  return (
    <div className="h-dvh flex flex-col">
      <div className="relative flex-1">
        <Image
          src={cocktail.imageUrl}
          alt={cocktail.name}
          fill
          sizes="100dvw"
          className="object-cover"
          priority={priority}
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{cocktail.name}</h3>
        <p className="text-sm text-gray-400 mb-4" lang={locale}>
          {cocktail.description}
        </p>
        <Button onClick={onOrder} className="w-full" disabled={disabled}>
          {t("orderButton")}
        </Button>
      </div>
    </div>
  )
}
