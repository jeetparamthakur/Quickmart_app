import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { useGoogleMapsProvider } from '@/utils/address';

export function isExpoGo(): boolean {
  return (
    Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  );
}

export function isStandaloneNativeBuild(): boolean {
  return (
    Constants.executionEnvironment === ExecutionEnvironment.Standalone ||
    Constants.executionEnvironment === ExecutionEnvironment.Bare
  );
}

/** OSM raster tiles only for release/dev APKs without a Google Maps API key (not Expo Go). */
export function shouldUseAndroidOsmStreetTiles(): boolean {
  return (
    Platform.OS === 'android' &&
    isStandaloneNativeBuild() &&
    !isExpoGo() &&
    !useGoogleMapsProvider()
  );
}
