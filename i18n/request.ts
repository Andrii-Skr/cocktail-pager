import { getRequestConfig } from "next-intl/server"
import { defaultLocale, type Locale, locales } from "./routing"

export async function getMessagesForLocale(locale: Locale) {
  return (await import(`../messages/${locale}/common.json`)).default
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  const resolvedLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale

  return {
    locale: resolvedLocale,
    messages: await getMessagesForLocale(resolvedLocale),
  }
})
