import { simulateDelay } from './utils';
import { products, stores, trendingSearches } from '../mock/data';
import { Product } from '@/types/product';
import { Store } from '@/types/store';

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
    await simulateDelay();
    return products.find((p) => p.id === id) ?? null;
  },

  async getByCategory(categoryId: string): Promise<Product[]> {
    await simulateDelay();
    return products.filter((p) => p.categoryId === categoryId);
  },

  async getByStore(storeId: string): Promise<Product[]> {
    await simulateDelay();
    return products.filter((p) => p.storeId === storeId);
  },

  async getSimilar(productId: string): Promise<Product[]> {
    await simulateDelay();
    const product = products.find((p) => p.id === productId);
    if (!product) return [];
    return products.filter((p) => p.categoryId === product.categoryId && p.id !== productId).slice(0, 8);
  },

  async search(query: string, filters?: SearchFilters): Promise<{ products: Product[]; stores: Store[] }> {
    await simulateDelay();
    const q = query.toLowerCase().trim();
    let matchedProducts = q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.storeName.toLowerCase().includes(q)
        )
      : products.slice(0, 20);

    let matchedStores = q
      ? stores.filter((s) => s.name.toLowerCase().includes(q))
      : stores.slice(0, 5);

    if (filters) {
      if (filters.minPrice) matchedProducts = matchedProducts.filter((p) => p.price >= filters.minPrice!);
      if (filters.maxPrice) matchedProducts = matchedProducts.filter((p) => p.price <= filters.maxPrice!);
      if (filters.minRating) matchedProducts = matchedProducts.filter((p) => p.rating >= filters.minRating!);
      if (filters.inStockOnly) matchedProducts = matchedProducts.filter((p) => p.inStock);
      if (filters.minDiscount) {
        matchedProducts = matchedProducts.filter((p) => {
          if (!p.originalPrice) return false;
          return ((p.originalPrice - p.price) / p.originalPrice) * 100 >= filters.minDiscount!;
        });
      }
    }

    return { products: matchedProducts, stores: matchedStores };
  },

  async getSuggestions(query: string): Promise<string[]> {
    await simulateDelay(100, 300);
    if (!query.trim()) return trendingSearches;
    const q = query.toLowerCase();
    const fromProducts = products
      .filter((p) => p.name.toLowerCase().includes(q))
      .map((p) => p.name)
      .slice(0, 5);
    const fromTrending = trendingSearches.filter((s) => s.toLowerCase().includes(q));
    return [...new Set([...fromTrending, ...fromProducts])].slice(0, 8);
  },
};
