/** „1 słówko”, „2 słówka”, „5 słówek”, „22 słówka”, „112 słówek”. */
export function formatWordCount(count: number): string {
  return `${count} ${pluralizeWord(count)}`;
}

function pluralizeWord(count: number): string {
  if (count === 1) return 'słówko';
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return 'słówka';
  }
  return 'słówek';
}

/** UUID v4; `crypto.randomUUID` działa tylko w bezpiecznym kontekście (https, localhost). */
export function newId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
