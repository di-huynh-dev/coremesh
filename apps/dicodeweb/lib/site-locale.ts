import { homeLocales, type HomeLocale } from '@/lib/home-content';

export const siteLocaleStorageKey = 'dicodeweb-home-locale';
export const siteLocaleChangeEvent = 'dicodeweb-locale-change';

export function getPreferredLocale(): HomeLocale {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const storedLocale = window.localStorage.getItem(siteLocaleStorageKey);

  if (storedLocale && homeLocales.includes(storedLocale as HomeLocale)) {
    return storedLocale as HomeLocale;
  }

  const browserLanguage = window.navigator.language.toLowerCase();

  if (browserLanguage.startsWith('vi')) {
    return 'vi';
  }

  if (browserLanguage.startsWith('ja')) {
    return 'ja';
  }

  return 'en';
}

export function subscribeToLocaleChange(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener(siteLocaleChangeEvent, handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(siteLocaleChangeEvent, handler);
  };
}

export function setPreferredLocale(locale: HomeLocale) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(siteLocaleStorageKey, locale);
  window.dispatchEvent(new Event(siteLocaleChangeEvent));
}
