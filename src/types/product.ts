export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  color: string;
};

export type ProductSeller = {
  storeId: string;
  storeName: string;
  price: number;
  originalPrice?: number;
  deliveryMinutes: number;
  inStock: boolean;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  image: string;
  images: string[];
  price: number;
  originalPrice?: number;
  unit: string;
  rating: number;
  reviewCount: number;
  description: string;
  specifications: Record<string, string>;
  storeId: string;
  storeName: string;
  inStock: boolean;
  sellers?: ProductSeller[];
  tags?: string[];
};

export type ProductSection = {
  id: string;
  title: string;
  products: Product[];
};
