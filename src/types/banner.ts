export type BannerTargetType = 'category' | 'product' | 'store' | 'url';

export type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  backgroundColor: string;
  targetType: BannerTargetType;
  targetId: string;
  startDate: string;
  endDate: string;
  position: number;
};
