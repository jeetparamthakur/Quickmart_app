const DEFAULT_EMAIL = 'support@quickmart.app';
/** E.164 digits without + (India example: 919876543210) */
const DEFAULT_PHONE_DIGITS = '919876543210';

export const SUPPORT_EMAIL =
  process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_EMAIL;

export const SUPPORT_PHONE_DIGITS =
  process.env.EXPO_PUBLIC_SUPPORT_PHONE?.replace(/\D/g, '') || DEFAULT_PHONE_DIGITS;

/** Human-readable phone for UI (10-digit Indian local if 91 prefix). */
export function formatSupportPhoneDisplay(digits = SUPPORT_PHONE_DIGITS): string {
  const d = digits.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) {
    return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  }
  return `+${d}`;
}
