export type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
  receiverName: string;
  receiverPhone: string;
};

export type LocationState = {
  selectedAddress: Address | null;
  savedAddresses: Address[];
};

export function formatDisplayPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function normalizePhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits.slice(0, 10);
}

export function isValidIndianMobile(digits: string): boolean {
  return /^[6-9]\d{9}$/.test(digits);
}

export function hasDeliveryContact(address: Address | null | undefined): boolean {
  if (!address) return false;
  return (
    Boolean(address.receiverName?.trim()) &&
    isValidIndianMobile(normalizePhoneDigits(address.receiverPhone ?? ''))
  );
}
