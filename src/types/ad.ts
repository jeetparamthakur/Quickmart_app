export type AdPlacement =
  | 'home_top'
  | 'home_middle'
  | 'category_banner'
  | 'search_inline'
  | 'listing_card';

export type AdCreative = {
  id: string;
  placement: AdPlacement;
  title: string;
  subtitle?: string;
  image: string;
  label: 'Sponsored' | 'Advertisement' | 'Promoted';
  targetType: 'url' | 'product' | 'store' | 'category';
  targetId: string;
  startDate: string;
  endDate: string;
  budget?: number;
  impressions?: number;
  clicks?: number;
};
