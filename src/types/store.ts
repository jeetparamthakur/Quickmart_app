export type PartnerType = 'STORE' | 'FOOD_STORE';

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
  partnerType?: PartnerType;
  ownerLabel?: string;
  serviceRadiusKm?: number;
};
