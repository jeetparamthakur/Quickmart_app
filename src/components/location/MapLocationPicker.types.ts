import type { AddressResult, MapFocus } from '@/utils/address';
import { DEFAULT_MAP_CENTER } from '@/utils/address';

export type MapLocationPickerProps = {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  onCurrentLocationResolved?: (result: AddressResult) => void;
  mapFocus?: MapFocus;
  fullScreen?: boolean;
  /** Explicit height avoids Android MapView rendering at 0px inside flex layouts. */
  mapHeight?: number;
};

export { DEFAULT_MAP_CENTER };
