import { Product } from '@/types/product';
import { Store } from '@/types/store';
import { Category } from '@/types/product';
import { Banner, BannerTargetType } from '@/types/banner';

export function mapBackendProduct(sp: Record<string, unknown>): Product {
  const mp = sp.masterProduct as Record<string, unknown> | undefined;
  const store = sp.store as Record<string, unknown> | undefined;
  const inv = sp.inventory as Record<string, unknown> | undefined;
  const qty = (inv?.quantityAvailable as number) ?? 0;
  const reserved = (inv?.quantityReserved as number) ?? 0;
  return {
    id: sp.id as string,
    name: (sp.title as string) ?? (mp?.name as string) ?? '',
    brand: (mp?.brand as string) ?? '',
    price: parseFloat(sp.sellingPrice as string),
    originalPrice: parseFloat(sp.mrp as string),
    image: 'https://picsum.photos/seed/' + sp.id + '/400/400',
    rating: 4.5,
    reviewCount: 0,
    unit: (mp?.baseUnit as string) ?? 'pc',
    inStock: qty - reserved > 0,
    categoryId: (mp?.categoryId as string) ?? '',
    storeId: (sp.storeId as string) ?? '',
    storeName: (store?.name as string) ?? 'Store',
    tags: [],
  };
}

export function mapBackendStore(s: Record<string, unknown>): Store {
  return {
    id: s.id as string,
    name: s.name as string,
    image: 'https://picsum.photos/seed/store-' + s.id + '/400/300',
    rating: 4.5,
    reviewCount: 0,
    distanceKm: 1.2,
    deliveryMinutes: 25,
    categories: [],
    isOpen: s.status === 'ACTIVE',
    address: (s.address as string) ?? '',
  };
}

export function mapBackendCategory(c: Record<string, unknown>): Category {
  return {
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
    icon: '🛒',
    image: 'https://picsum.photos/seed/cat-' + c.id + '/200/200',
    productCount: 0,
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
