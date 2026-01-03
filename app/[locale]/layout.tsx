import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import type { ReactNode } from "react"
import { getMessagesForLocale } from "@/i18n/request"
import { type Locale, locales } from "@/i18n/routing"
import Providers from "../providers"

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessagesForLocale(locale as Locale)

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  )
}
