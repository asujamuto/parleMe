/** `localStorage` albo `undefined`, gdy przeglądarka blokuje dostęp (np. tryb prywatny, SSR). */
export function browserStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
