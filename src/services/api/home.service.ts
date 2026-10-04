import { apiRequest } from './client';
import { simulateDelay } from './utils';
import { banners, categories, products } from '../mock/data';
import { storeService } from './store.service';
import { productService } from './product.service';
import { Banner } from '@/types/banner';
import { Category, Product, ProductSection } from '@/types/product';
import { Store } from '@/types/store';
import { USE_MOCK } from '@/constants/api';
import { mapBackendBanner, mapBackendCategory, mapBackendProduct } from './mappers';
import { DEFAULT_CUSTOMER_RADIUS_KM } from '@/utils/geo';

export type GroceriesFeed = {
  nearestStore: Store | null;
  sections: ProductSection[];
};

export type FoodFeed = {
  nearestStore: Store | null;
  sections: ProductSection[];
};

function chunkSections(items: Product[], prefix: string): ProductSection[] {
  if (!items.length) return [];
  const titles = ['Popular near you', 'Best picks', 'More to explore', 'Daily favourites'];
  const size = Math.max(Math.ceil(items.length / titles.length), 4);
  return titles
    .map((title, i) => ({
      id: `${prefix}-${i}`,
      title,
      products: items.slice(i * size, (i + 1) * size),
    }))
    .filter((s) => s.products.length > 0);
}

export const homeService = {
  async getBanners(): Promise<Banner[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return banners.filter((b) => new Date(b.endDate) >= new Date());
    }
    const data = await apiRequest<Record<string, unknown>[]>('/banners?placement=HOME_TOP');
    return data.map(mapBackendBanner);
  },

  async getCategories(): Promise<Category[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return categories;
    }
    const data = await apiRequest<Record<string, unknown>[]>('/categories');
    return data.map(mapBackendCategory);
  },

  async getNearbyStores(lat?: number, lng?: number): Promise<Store[]> {
    return storeService.getNearby({ lat, lng, radiusKm: DEFAULT_CUSTOMER_RADIUS_KM });
  },

  async getProductSections(): Promise<ProductSection[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const byTag = (tag: string) => products.filter((p) => p.tags?.includes(tag)).slice(0, 10);
      return [
        { id: 'popular', title: 'Popular Near You', products: byTag('popular').length ? byTag('popular') : products.slice(0, 10) },
        { id: 'bestsellers', title: 'Best Sellers', products: byTag('bestseller').length ? byTag('bestseller') : products.slice(10, 20) },
        { id: 'trending', title: 'Trending Products', products: byTag('trending').length ? byTag('trending') : products.slice(20, 30) },
        { id: 'daily', title: 'Daily Essentials', products: byTag('daily').length ? byTag('daily') : products.slice(30, 40) },
      ];
    }
    const res = await apiRequest<{ data: Record<string, unknown>[] }>('/products?limit=40');
    const mapped = res.data.map(mapBackendProduct);
    return [
      { id: 'popular', title: 'Popular Near You', products: mapped.slice(0, 10) },
      { id: 'bestsellers', title: 'Best Sellers', products: mapped.slice(10, 20) },
      { id: 'trending', title: 'Trending Products', products: mapped.slice(20, 30) },
      { id: 'daily', title: 'Daily Essentials', products: mapped.slice(30, 40) },
    ];
  },

  async getGroceriesFeed(lat?: number, lng?: number): Promise<GroceriesFeed> {
    const nearby = await storeService.getNearby({
      lat,
      lng,
      radiusKm: DEFAULT_CUSTOMER_RADIUS_KM,
      partnerType: 'STORE',
    });
    const nearestStore = nearby[0] ?? null;
    if (!nearestStore) {
      return { nearestStore: null, sections: [] };
    }

    const storeProducts = await productService.getRetailByStore(nearestStore.id);
    return {
      nearestStore,
      sections: chunkSections(storeProducts, 'grocery'),
    };
  },

  async getFoodFeed(lat?: number, lng?: number): Promise<FoodFeed> {
    const nearby = await storeService.getNearby({
      lat,
      lng,
      radiusKm: DEFAULT_CUSTOMER_RADIUS_KM,
      partnerType: 'FOOD_STORE',
    });
    const nearestStore = nearby[0] ?? null;
    if (!nearestStore) {
      return { nearestStore: null, sections: [] };
    }

    const menuItems = await productService.listFoodByStores([nearestStore.id]);
    return {
      nearestStore,
      sections: chunkSections(menuItems, 'food'),
    };
  },
};
