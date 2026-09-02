import { apiRequest } from './client';
import { simulateDelay } from './utils';
import { banners, categories, products } from '../mock/data';
import { storeService } from './store.service';
import { Banner } from '@/types/banner';
import { Category, ProductSection } from '@/types/product';
import { Store } from '@/types/store';
import { USE_MOCK } from '@/constants/api';
import { mapBackendBanner, mapBackendCategory, mapBackendProduct } from './mappers';

export const homeService = {
  async getBanners(): Promise<Banner[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return banners.filter((b) => new Date(b.endDate) >= new Date());
    }
    const data = await apiRequest<Record<string, unknown>[]>('/banners');
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
    return storeService.getNearby(lat, lng);
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
};
