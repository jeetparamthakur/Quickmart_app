import { apiRequest } from './client';
import { simulateDelay } from './utils';
import { products, stores, trendingSearches } from '../mock/data';
import { Product } from '@/types/product';
import { Store } from '@/types/store';
import { USE_MOCK } from '@/constants/api';
import { mapBackendProduct, mapBackendStore } from './mappers';

export type SearchFilters = {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxDistance?: number;
  maxDeliveryMinutes?: number;
  minDiscount?: number;
  inStockOnly?: boolean;
};

export const productService = {
  async getById(id: string): Promise<Product | null> {
    if (USE_MOCK) {
      await simulateDelay();
      return products.find((p) => p.id === id) ?? null;
    }
    try {
      const data = await apiRequest<Record<string, unknown>>(`/products/${id}`);
      return mapBackendProduct(data);
    } catch {
      return null;
    }
  },

  async getByCategory(categoryId: string): Promise<Product[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return products.filter((p) => p.categoryId === categoryId);
    }
    const res = await apiRequest<{ data: Record<string, unknown>[] }>(
      `/products?categoryId=${categoryId}&limit=50`,
    );
    return res.data.map(mapBackendProduct);
  },

  async getByStore(storeId: string): Promise<Product[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return products.filter((p) => p.storeId === storeId);
    }
    const data = await apiRequest<Record<string, unknown>[]>(`/stores/${storeId}/products`);
    return data.map(mapBackendProduct);
  },

  async getSimilar(productId: string): Promise<Product[]> {
    const product = await this.getById(productId);
    if (!product) return [];
    return this.getByCategory(product.categoryId);
  },

  async search(query: string, filters?: SearchFilters): Promise<{ products: Product[]; stores: Store[] }> {
    if (USE_MOCK) {
      await simulateDelay();
      const q = query.toLowerCase().trim();
      let matchedProducts = q
        ? products.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q) ||
              p.storeName.toLowerCase().includes(q),
          )
        : products.slice(0, 20);
      let matchedStores = q ? stores.filter((s) => s.name.toLowerCase().includes(q)) : stores.slice(0, 5);
      if (filters?.inStockOnly) matchedProducts = matchedProducts.filter((p) => p.inStock);
      return { products: matchedProducts, stores: matchedStores };
    }
    const [prodRes, storeData] = await Promise.all([
      apiRequest<{ data: Record<string, unknown>[] }>(`/products?q=${encodeURIComponent(query)}&limit=30`),
      apiRequest<Record<string, unknown>[]>('/stores'),
    ]);
    let matchedProducts = prodRes.data.map(mapBackendProduct);
    if (filters?.inStockOnly) matchedProducts = matchedProducts.filter((p) => p.inStock);
    const matchedStores = storeData.map(mapBackendStore);
    return { products: matchedProducts, stores: matchedStores };
  },

  async getSuggestions(query: string): Promise<string[]> {
    if (USE_MOCK) {
      await simulateDelay(100, 300);
      if (!query.trim()) return trendingSearches;
      const q = query.toLowerCase();
      return trendingSearches.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
    }
    const { products: results } = await this.search(query);
    return results.map((p) => p.name).slice(0, 8);
  },
};
