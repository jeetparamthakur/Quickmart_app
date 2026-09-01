import { simulateDelay } from './utils';
import { banners, categories, products } from '../mock/data';
import { storeService } from './store.service';
import { Banner } from '@/types/banner';
import { Category, Product, ProductSection } from '@/types/product';
import { Store } from '@/types/store';

export const homeService = {
  async getBanners(): Promise<Banner[]> {
    await simulateDelay();
    return banners.filter((b) => new Date(b.endDate) >= new Date());
  },

  async getCategories(): Promise<Category[]> {
    await simulateDelay();
    return categories;
  },

  async getNearbyStores(lat?: number, lng?: number): Promise<Store[]> {
    return storeService.getNearby(lat, lng);
  },

  async getProductSections(): Promise<ProductSection[]> {
    await simulateDelay();
    const byTag = (tag: string) => products.filter((p) => p.tags?.includes(tag)).slice(0, 10);
    return [
      { id: 'popular', title: 'Popular Near You', products: byTag('popular').length ? byTag('popular') : products.slice(0, 10) },
      { id: 'bestsellers', title: 'Best Sellers', products: byTag('bestseller').length ? byTag('bestseller') : products.slice(10, 20) },
      { id: 'trending', title: 'Trending Products', products: byTag('trending').length ? byTag('trending') : products.slice(20, 30) },
      { id: 'daily', title: 'Daily Essentials', products: byTag('daily').length ? byTag('daily') : products.slice(30, 40) },
    ];
  },
};
