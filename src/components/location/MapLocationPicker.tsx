import type { ComponentType } from 'react';
import { useGoogleMapsProvider } from '@/utils/address';
import { isStandaloneNativeBuild } from '@/utils/expoRuntime';
import { isMapLibreNativeAvailable } from '@/utils/mapLibreNative';
import type { MapLocationPickerProps } from './MapLocationPicker.types';
import { RnMapsLocationPicker } from './RnMapsLocationPicker';

export type { MapLocationPickerProps } from './MapLocationPicker.types';
export { DEFAULT_MAP_CENTER } from './MapLocationPicker.types';

let mapLibrePicker: ComponentType<MapLocationPickerProps> | null = null;

/** Loaded only when MapLibre is linked — avoids crashing Expo Go at import time. */
function MapLibreLocationPickerLazy(props: MapLocationPickerProps) {
  if (!mapLibrePicker) {
    try {
      mapLibrePicker = require('./MapLibreLocationPicker').MapLibreLocationPicker;
    } catch {
      mapLibrePicker = RnMapsLocationPicker;
    }
  }
  const Picker = mapLibrePicker ?? RnMapsLocationPicker;
  return <Picker {...props} />;
}

/** MapLibre + OSM when native module is present; otherwise react-native-maps (Expo Go / dev). */
export function MapLocationPicker(props: MapLocationPickerProps) {
  if (useGoogleMapsProvider()) {
    return <RnMapsLocationPicker {...props} />;
  }

  if (isStandaloneNativeBuild() && isMapLibreNativeAvailable()) {
    return <MapLibreLocationPickerLazy {...props} />;
  }

  return <RnMapsLocationPicker {...props} />;
}
