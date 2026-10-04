export function formatPrice(amount: number | null | undefined): string {
  const value = Number(amount ?? 0);
  return `₹${value.toLocaleString('en-IN')}`;
}

export function formatDistance(km: number | null | undefined): string {
  const distance = Number(km ?? 0);
  if (distance < 1) return `${Math.round(distance * 1000)} m away`;
  return `${distance.toFixed(1)} km away`;
}

export function formatDiscount(original: number, current: number): number {
  if (original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
