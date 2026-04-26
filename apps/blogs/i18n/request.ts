import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
  let resolvedLocale = await requestLocale;
  
  if (!resolvedLocale || !["en", "vi"].includes(resolvedLocale)) {
    resolvedLocale = "en";
  }

  try {
    const messages = (await import(`../messages/${resolvedLocale}.json`))
      .default;
    return {
      locale: resolvedLocale,
      messages,
    };
  } catch (error) {
    console.error(
      `Failed to load messages for locale: ${resolvedLocale}`,
      error,
    );
    // Fallback to English
    const messages = (await import(`../messages/en.json`)).default;
    return {
      locale: "en",
      messages,
    };
  }
});
