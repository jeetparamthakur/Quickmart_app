import { Product } from '@/types/product';
import { Store } from '@/types/store';
import { Category } from '@/types/product';
import { Banner, BannerTargetType } from '@/types/banner';

export function mapBackendProduct(sp: Record<string, unknown>): Product {
  const mp = sp.masterProduct as Record<string, unknown> | undefined;
  const store = sp.store as Record<string, unknown> | undefined;
  const inv = sp.inventory as Record<string, unknown> | undefined;
  const attrs = (mp?.attributes as Record<string, unknown> | undefined) ?? {};
  const qty = (inv?.quantityAvailable as number) ?? 0;
  const reserved = (inv?.quantityReserved as number) ?? 0;
  const id = sp.id as string;
  const image = 'https://picsum.photos/seed/' + id + '/400/400';
  const topProductType = sp.productType as string | undefined;
  const productType =
    topProductType === 'food' || attrs.productType === 'food' ? 'food' : 'retail';

  return {
    id,
    name: (mp?.name as string) ?? (sp.title as string) ?? '',
    brand: (mp?.brand as string) ?? '',
    price: parseFloat(sp.sellingPrice as string),
    originalPrice: parseFloat(sp.mrp as string),
    image,
    images: [image],
    rating: 4.5,
    reviewCount: 0,
    unit: (mp?.baseUnit as string) ?? 'pc',
    description: (mp?.description as string) ?? '',
    specifications: {},
    inStock: qty - reserved > 0,
    categoryId: (mp?.categoryId as string) ?? '',
    storeId: (sp.storeId as string) ?? '',
    storeName: (store?.name as string) ?? 'Store',
    tags: [],
    productType,
    isVeg: typeof attrs.isVeg === 'boolean' ? attrs.isVeg : undefined,
    prepTimeMinutes:
      typeof attrs.prepTimeMinutes === 'number' ? attrs.prepTimeMinutes : undefined,
  };
}

export function mapBackendStore(s: Record<string, unknown>): Store {
  const id = s.id as string;
  const details = (s.details as Record<string, unknown> | undefined) ?? {};
  const lat =
    s.lat != null
      ? parseFloat(String(s.lat))
      : typeof details.latitude === 'number'
        ? details.latitude
        : 0;
  const lng =
    s.lng != null
      ? parseFloat(String(s.lng))
      : typeof details.longitude === 'number'
        ? details.longitude
        : 0;

  const deliveryMinutes =
    typeof details.deliveryMinutes === 'number' ? details.deliveryMinutes : 25;

  return {
    id,
    name: s.name as string,
    image: `https://picsum.photos/seed/store-${id}/400/300`,
    logo: `https://picsum.photos/seed/logo-${id}/80/80`,
    rating: 4.5,
    reviewCount: 0,
    distanceKm: typeof s.distanceKm === 'number' ? s.distanceKm : 1.2,
    deliveryMinutes,
    deliveryFee: 0,
    categories: [],
    isOpen: s.status === 'ACTIVE' || s.status === undefined,
    latitude: lat,
    longitude: lng,
    partnerType: (s.partnerType as Store['partnerType']) ?? 'STORE',
    ownerLabel: s.ownerLabel as string | undefined,
    serviceRadiusKm:
      s.serviceRadiusKm != null ? parseFloat(String(s.serviceRadiusKm)) : undefined,
  };
}

export function mapBackendNearbyStore(s: Record<string, unknown>): Store {
  const base = mapBackendStore(s);
  return {
    ...base,
    distanceKm: Number(s.distanceKm ?? base.distanceKm),
    latitude: Number(s.latitude ?? base.latitude),
    longitude: Number(s.longitude ?? base.longitude),
    deliveryMinutes:
      typeof s.deliveryMinutes === 'number' ? s.deliveryMinutes : base.deliveryMinutes,
    partnerType: (s.partnerType as Store['partnerType']) ?? base.partnerType,
    ownerLabel: s.ownerLabel as string | undefined,
    serviceRadiusKm: Number(s.serviceRadiusKm ?? base.serviceRadiusKm ?? 5),
  };
}

export function mapBackendCategory(c: Record<string, unknown>): Category {
  return {
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
    icon: '🛒',
    image: 'https://picsum.photos/seed/cat-' + c.id + '/200/200',
    color: '#E8F5E9',
  };
}

function parseBannerLink(linkUrl?: string | null): { targetType: BannerTargetType; targetId: string } {
  if (!linkUrl) {
    return { targetType: 'url', targetId: '' };
  }

  const trimmed = linkUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { targetType: 'url', targetId: trimmed };
  }

  const match = trimmed.match(/^\/(category|store|product)\/([^/?#]+)/i);
  if (match) {
    const type = match[1].toLowerCase() as BannerTargetType;
    return { targetType: type, targetId: match[2] };
  }

  return { targetType: 'url', targetId: trimmed };
}

export function mapBackendBanner(b: Record<string, unknown>): Banner {
  const { targetType, targetId } = parseBannerLink(b.linkUrl as string | null | undefined);

  return {
    id: b.id as string,
    title: (b.title as string) ?? '',
    image: (b.imageUrl as string) ?? 'https://picsum.photos/800/300',
    backgroundColor: '#2E7D32',
    targetType,
    targetId,
    startDate: new Date().toISOString(),
    endDate: '2099-12-31T23:59:59.000Z',
    position: (b.sortOrder as number) ?? 0,
  };
}
