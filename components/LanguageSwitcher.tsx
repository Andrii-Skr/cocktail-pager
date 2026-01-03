"use client"

import { ChevronDown } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { defaultLocale, type Locale, locales } from "@/i18n/routing"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
}

export function LanguageSwitcher({ className }: Props) {
  const t = useTranslations("language")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const safePathname = pathname ?? "/"
  const search = searchParams?.toString() ?? ""
  const currentLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale

  const buildPathname = (nextLocale: Locale) => {
    const segments = safePathname.split("/")
    const hasLocale =
      segments.length > 1 && locales.includes(segments[1] as Locale)
    const nextSegments = [...segments]

    if (hasLocale) {
      nextSegments[1] = nextLocale
    } else {
      nextSegments.splice(1, 0, nextLocale)
    }

    if (
      nextSegments.length > 2 &&
      nextSegments[nextSegments.length - 1] === ""
    ) {
      nextSegments.pop()
    }

    const nextPathname = nextSegments.join("/") || "/"
    return search ? `${nextPathname}?${search}` : nextPathname
  }

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [open])

  return (
    <div
      ref={menuRef}
      className={cn("relative inline-flex items-center", className)}
    >
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="gap-1 px-2"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("label")}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{t(currentLocale)}</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </Button>
      {open ? (
        <div
          role="listbox"
          aria-label={t("label")}
          className="absolute right-0 top-full z-20 mt-2 min-w-[7rem] rounded-xl border border-white/10 bg-zinc-950/95 p-1 shadow-lg backdrop-blur"
        >
          {locales.map((item) => {
            const active = item === currentLocale
            return (
              <button
                key={item}
                type="button"
                role="option"
                aria-selected={active}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10",
                  active && "bg-white/15 text-white"
                )}
                onClick={() => {
                  setOpen(false)
                  router.replace(buildPathname(item))
                }}
              >
                <span>{t(item)}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
