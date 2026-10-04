import { TurboModuleRegistry } from 'react-native';

/** True when @maplibre/maplibre-react-native is linked in the native binary (not Expo Go). */
export function isMapLibreNativeAvailable(): boolean {
  try {
    const mod = TurboModuleRegistry.get('MLRNCameraModule');
    return mod != null;
  } catch {
    return false;
  }
}
