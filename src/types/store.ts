export type Store = {
  id: string;
  name: string;
  image: string;
  logo: string;
  rating: number;
  reviewCount: number;
  deliveryMinutes: number;
  distanceKm: number;
  deliveryFee: number;
  offer?: string;
  isOpen: boolean;
  categories: string[];
  latitude: number;
  longitude: number;
};
