import { Category } from '@/types/product';
import { Store } from '@/types/store';
import { Product } from '@/types/product';
import { Banner } from '@/types/banner';
import { Address } from '@/types/location';

export const categories: Category[] = [
  { id: 'cat-1', name: 'Grocery', slug: 'grocery', icon: '🛒', image: 'https://picsum.photos/seed/grocery/200/200', color: '#E8F5E9' },
  { id: 'cat-2', name: 'Fruits & Veg', slug: 'fruits-vegetables', icon: '🥬', image: 'https://picsum.photos/seed/fruits/200/200', color: '#FFF3E0' },
  { id: 'cat-3', name: 'Dairy', slug: 'dairy', icon: '🥛', image: 'https://picsum.photos/seed/dairy/200/200', color: '#E3F2FD' },
  { id: 'cat-4', name: 'Snacks', slug: 'snacks', icon: '🍿', image: 'https://picsum.photos/seed/snacks/200/200', color: '#FCE4EC' },
  { id: 'cat-5', name: 'Beverages', slug: 'beverages', icon: '🥤', image: 'https://picsum.photos/seed/beverages/200/200', color: '#E0F7FA' },
  { id: 'cat-6', name: 'Electronics', slug: 'electronics', icon: '📱', image: 'https://picsum.photos/seed/electronics/200/200', color: '#EDE7F6' },
  { id: 'cat-7', name: 'Beauty', slug: 'beauty', icon: '💄', image: 'https://picsum.photos/seed/beauty/200/200', color: '#F3E5F5' },
  { id: 'cat-8', name: 'Fashion', slug: 'fashion', icon: '👕', image: 'https://picsum.photos/seed/fashion/200/200', color: '#FFF8E1' },
  { id: 'cat-9', name: 'Pharmacy', slug: 'pharmacy', icon: '💊', image: 'https://picsum.photos/seed/pharmacy/200/200', color: '#FFEBEE' },
  { id: 'cat-10', name: 'Home', slug: 'home-essentials', icon: '🏠', image: 'https://picsum.photos/seed/home/200/200', color: '#EFEBE9' },
  { id: 'cat-11', name: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾', image: 'https://picsum.photos/seed/pets/200/200', color: '#E8EAF6' },
  { id: 'cat-12', name: 'Local Products', slug: 'local-products', icon: '🏪', image: 'https://picsum.photos/seed/local/200/200', color: '#F1F8E9' },
];

export const stores: Store[] = [
  { id: 'store-1', name: 'ABC Supermarket', image: 'https://picsum.photos/seed/store1/400/200', logo: 'https://picsum.photos/seed/logo1/80/80', rating: 4.5, reviewCount: 2340, deliveryMinutes: 12, distanceKm: 1.2, deliveryFee: 0, offer: 'Free delivery', isOpen: true, categories: ['grocery', 'dairy', 'snacks'], latitude: 28.6139, longitude: 77.209 },
  { id: 'store-2', name: 'Fresh Mart', image: 'https://picsum.photos/seed/store2/400/200', logo: 'https://picsum.photos/seed/logo2/80/80', rating: 4.3, reviewCount: 1820, deliveryMinutes: 15, distanceKm: 1.8, deliveryFee: 20, offer: '20% OFF', isOpen: true, categories: ['fruits-vegetables', 'grocery'], latitude: 28.615, longitude: 77.21 },
  { id: 'store-3', name: 'Rahul Store', image: 'https://picsum.photos/seed/store3/400/200', logo: 'https://picsum.photos/seed/logo3/80/80', rating: 4.7, reviewCount: 890, deliveryMinutes: 18, distanceKm: 2.1, deliveryFee: 15, isOpen: true, categories: ['electronics', 'fashion'], latitude: 28.612, longitude: 77.205 },
  { id: 'store-4', name: 'Aman Seller', image: 'https://picsum.photos/seed/store4/400/200', logo: 'https://picsum.photos/seed/logo4/80/80', rating: 4.8, reviewCount: 456, deliveryMinutes: 25, distanceKm: 3.0, deliveryFee: 25, offer: 'Handmade', isOpen: true, categories: ['local-products', 'home-essentials'], latitude: 28.618, longitude: 77.215 },
  { id: 'store-5', name: 'MedPlus Pharmacy', image: 'https://picsum.photos/seed/store5/400/200', logo: 'https://picsum.photos/seed/logo5/80/80', rating: 4.6, reviewCount: 3200, deliveryMinutes: 20, distanceKm: 2.5, deliveryFee: 0, isOpen: true, categories: ['pharmacy'], latitude: 28.61, longitude: 77.2 },
  { id: 'store-6', name: 'Beauty Hub', image: 'https://picsum.photos/seed/store6/400/200', logo: 'https://picsum.photos/seed/logo6/80/80', rating: 4.4, reviewCount: 670, deliveryMinutes: 22, distanceKm: 2.8, deliveryFee: 30, isOpen: false, categories: ['beauty'], latitude: 28.62, longitude: 77.22 },
  { id: 'store-7', name: 'Quick Bites', image: 'https://picsum.photos/seed/store7/400/200', logo: 'https://picsum.photos/seed/logo7/80/80', rating: 4.2, reviewCount: 1100, deliveryMinutes: 10, distanceKm: 0.8, deliveryFee: 10, offer: 'Flat 50% OFF', isOpen: true, categories: ['snacks', 'beverages'], latitude: 28.614, longitude: 77.208 },
  { id: 'store-8', name: 'Tech Zone', image: 'https://picsum.photos/seed/store8/400/200', logo: 'https://picsum.photos/seed/logo8/80/80', rating: 4.1, reviewCount: 540, deliveryMinutes: 30, distanceKm: 3.5, deliveryFee: 40, isOpen: true, categories: ['electronics'], latitude: 28.625, longitude: 77.225 },
];

const productTemplates = [
  { name: 'Amul Taaza Milk', brand: 'Amul', categoryId: 'cat-3', unit: '500 ml', price: 28, originalPrice: 30, storeId: 'store-1', storeName: 'ABC Supermarket', tags: ['bestseller', 'daily'] },
  { name: 'Britannia Bread', brand: 'Britannia', categoryId: 'cat-1', unit: '400 g', price: 45, originalPrice: 50, storeId: 'store-1', storeName: 'ABC Supermarket', tags: ['daily'] },
  { name: 'Fresh Bananas', brand: 'Fresh Farm', categoryId: 'cat-2', unit: '1 kg', price: 49, originalPrice: 60, storeId: 'store-2', storeName: 'Fresh Mart', tags: ['popular'] },
  { name: 'Lay\'s Classic Salted', brand: 'Lay\'s', categoryId: 'cat-4', unit: '52 g', price: 20, storeId: 'store-7', storeName: 'Quick Bites', tags: ['trending'] },
  { name: 'Coca Cola', brand: 'Coca Cola', categoryId: 'cat-5', unit: '750 ml', price: 40, originalPrice: 45, storeId: 'store-7', storeName: 'Quick Bites', tags: ['bestseller'] },
  { name: 'Samsung USB-C Cable', brand: 'Samsung', categoryId: 'cat-6', unit: '1 pc', price: 299, originalPrice: 499, storeId: 'store-3', storeName: 'Rahul Store', tags: ['trending'] },
  { name: 'Mobile Cover iPhone 15', brand: 'Spigen', categoryId: 'cat-6', unit: '1 pc', price: 599, originalPrice: 899, storeId: 'store-3', storeName: 'Rahul Store', tags: ['popular'] },
  { name: 'Lakme Face Wash', brand: 'Lakme', categoryId: 'cat-7', unit: '100 g', price: 199, originalPrice: 249, storeId: 'store-6', storeName: 'Beauty Hub', tags: [] },
  { name: 'Cotton T-Shirt', brand: 'Roadster', categoryId: 'cat-8', unit: '1 pc', price: 399, originalPrice: 799, storeId: 'store-3', storeName: 'Rahul Store', tags: ['trending'] },
  { name: 'Dolo 650', brand: 'Micro Labs', categoryId: 'cat-9', unit: '15 tablets', price: 32, storeId: 'store-5', storeName: 'MedPlus Pharmacy', tags: ['daily'] },
  { name: 'Dettol Handwash', brand: 'Dettol', categoryId: 'cat-10', unit: '200 ml', price: 99, originalPrice: 120, storeId: 'store-1', storeName: 'ABC Supermarket', tags: ['bestseller'] },
  { name: 'Pedigree Dog Food', brand: 'Pedigree', categoryId: 'cat-11', unit: '1.2 kg', price: 349, originalPrice: 399, storeId: 'store-1', storeName: 'ABC Supermarket', tags: [] },
  { name: 'Handmade Candle', brand: 'Aman Crafts', categoryId: 'cat-12', unit: '1 pc', price: 249, storeId: 'store-4', storeName: 'Aman Seller', tags: ['local'] },
  { name: 'Basmati Rice', brand: 'India Gate', categoryId: 'cat-1', unit: '5 kg', price: 599, originalPrice: 699, storeId: 'store-1', storeName: 'ABC Supermarket', tags: ['daily', 'bestseller'] },
  { name: 'Tomatoes', brand: 'Fresh Farm', categoryId: 'cat-2', unit: '500 g', price: 25, storeId: 'store-2', storeName: 'Fresh Mart', tags: ['daily'] },
  { name: 'Curd', brand: 'Mother Dairy', categoryId: 'cat-3', unit: '400 g', price: 35, storeId: 'store-1', storeName: 'ABC Supermarket', tags: ['daily'] },
  { name: 'Kurkure Masala Munch', brand: 'Kurkure', categoryId: 'cat-4', unit: '90 g', price: 20, storeId: 'store-7', storeName: 'Quick Bites', tags: ['popular'] },
  { name: 'Red Bull Energy', brand: 'Red Bull', categoryId: 'cat-5', unit: '250 ml', price: 125, storeId: 'store-7', storeName: 'Quick Bites', tags: [] },
  { name: 'Boat Rockerz 450', brand: 'Boat', categoryId: 'cat-6', unit: '1 pc', price: 1499, originalPrice: 2499, storeId: 'store-8', storeName: 'Tech Zone', tags: ['trending', 'bestseller'] },
  { name: 'Maybelline Lipstick', brand: 'Maybelline', categoryId: 'cat-7', unit: '1 pc', price: 349, originalPrice: 449, storeId: 'store-6', storeName: 'Beauty Hub', tags: [] },
];

function buildProducts(): Product[] {
  const products: Product[] = [];
  productTemplates.forEach((tpl, i) => {
    const id = `prod-${i + 1}`;
    const img = `https://picsum.photos/seed/prod${i + 1}/300/300`;
    const rating = 3.8 + (i % 12) * 0.1;
    products.push({
      id,
      name: tpl.name,
      brand: tpl.brand,
      categoryId: tpl.categoryId,
      image: img,
      images: [img, `https://picsum.photos/seed/prod${i + 1}b/300/300`],
      price: tpl.price,
      originalPrice: tpl.originalPrice,
      unit: tpl.unit,
      rating: Math.min(rating, 4.9),
      reviewCount: 100 + i * 47,
      description: `${tpl.name} by ${tpl.brand}. Premium quality product delivered fresh to your doorstep.`,
      specifications: { Brand: tpl.brand, Unit: tpl.unit, Category: tpl.categoryId },
      storeId: tpl.storeId,
      storeName: tpl.storeName,
      inStock: true,
      tags: tpl.tags,
    });
  });

  // Add more products to reach 60+
  for (let j = 0; j < 45; j++) {
    const tpl = productTemplates[j % productTemplates.length];
    const id = `prod-${productTemplates.length + j + 1}`;
    const img = `https://picsum.photos/seed/extra${j}/300/300`;
    products.push({
      id,
      name: `${tpl.name} ${j % 3 === 0 ? 'Premium' : 'Regular'}`,
      brand: tpl.brand,
      categoryId: tpl.categoryId,
      image: img,
      images: [img],
      price: tpl.price + (j % 5) * 10,
      originalPrice: tpl.originalPrice ? tpl.originalPrice + (j % 5) * 10 : undefined,
      unit: tpl.unit,
      rating: 3.5 + (j % 15) * 0.1,
      reviewCount: 50 + j * 13,
      description: `Quality ${tpl.name} available for quick delivery.`,
      specifications: { Brand: tpl.brand, Unit: tpl.unit },
      storeId: stores[j % stores.length].id,
      storeName: stores[j % stores.length].name,
      inStock: j % 17 !== 0,
      tags: tpl.tags,
    });
  }

  // Multi-seller products
  const multiSellerIds = ['prod-1', 'prod-2', 'prod-6', 'prod-7', 'prod-13'];
  multiSellerIds.forEach((pid) => {
    const p = products.find((x) => x.id === pid);
    if (p) {
      p.sellers = [
        { storeId: p.storeId, storeName: p.storeName, price: p.price, originalPrice: p.originalPrice, deliveryMinutes: 12, inStock: true },
        { storeId: 'store-2', storeName: 'Fresh Mart', price: p.price + 5, deliveryMinutes: 18, inStock: true },
        { storeId: 'store-7', storeName: 'Quick Bites', price: p.price - 2, originalPrice: p.originalPrice, deliveryMinutes: 10, inStock: true },
      ].sort((a, b) => a.price - b.price);
    }
  });

  return products;
}

export const products = buildProducts();

export const banners: Banner[] = [
  { id: 'banner-1', title: 'Flat 50% OFF', subtitle: 'On first order', image: 'https://picsum.photos/seed/banner1/800/300', backgroundColor: '#0D7A5F', targetType: 'category', targetId: 'cat-1', startDate: '2026-01-01', endDate: '2026-12-31', position: 1 },
  { id: 'banner-2', title: 'Free Delivery', subtitle: 'On orders above ₹199', image: 'https://picsum.photos/seed/banner2/800/300', backgroundColor: '#F5A623', targetType: 'url', targetId: '', startDate: '2026-01-01', endDate: '2026-12-31', position: 2 },
  { id: 'banner-3', title: 'Grocery Deals', subtitle: 'Up to 40% off', image: 'https://picsum.photos/seed/banner3/800/300', backgroundColor: '#065A46', targetType: 'category', targetId: 'cat-1', startDate: '2026-01-01', endDate: '2026-12-31', position: 3 },
  { id: 'banner-4', title: 'Electronics Sale', subtitle: 'Limited time', image: 'https://picsum.photos/seed/banner4/800/300', backgroundColor: '#1A1A2E', targetType: 'category', targetId: 'cat-6', startDate: '2026-01-01', endDate: '2026-12-31', position: 4 },
  { id: 'banner-5', title: 'Festival Offers', subtitle: 'Celebrate with savings', image: 'https://picsum.photos/seed/banner5/800/300', backgroundColor: '#B45309', targetType: 'store', targetId: 'store-1', startDate: '2026-01-01', endDate: '2026-12-31', position: 5 },
  { id: 'banner-6', title: 'New Store Launch', subtitle: 'Tech Zone is here', image: 'https://picsum.photos/seed/banner6/800/300', backgroundColor: '#4338CA', targetType: 'store', targetId: 'store-8', startDate: '2026-01-01', endDate: '2026-12-31', position: 6 },
];

export const addresses: Address[] = [
  { id: 'addr-1', label: 'Home', line1: '42, Green Park Extension', line2: 'Near Metro Station', city: 'New Delhi', pincode: '110016', latitude: 28.5672, longitude: 77.2101, isDefault: true },
  { id: 'addr-2', label: 'Work', line1: 'Cyber Hub, Tower B', line2: 'DLF Phase 3', city: 'Gurugram', pincode: '122002', latitude: 28.4946, longitude: 77.0889 },
  { id: 'addr-3', label: 'Other', line1: '123, Saket Main Market', city: 'New Delhi', pincode: '110017', latitude: 28.5244, longitude: 77.2066 },
];

export const trendingSearches = [
  'Milk', 'Bread', 'Bananas', 'Mobile cover', 'Face wash', 'Energy drink', 'Rice', 'Handwash',
];

export const mockUser = {
  id: 'user-1',
  name: 'Customer',
  phone: '+91 9876543210',
  email: 'customer@quickmart.app',
};
