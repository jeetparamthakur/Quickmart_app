import { Platform } from 'react-native';
import Constants from 'expo-constants';

const FALLBACK_API_URL = 'http://localhost:3000/api/v1';

function getDevMachineHost(): string | null {
  const sources = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.linkingUri,
  ].filter(Boolean) as string[];

  for (const source of sources) {
    const ip = source.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
    if (ip) return ip[1];
  }

  if (Platform.OS === 'android') return '10.0.2.2';
  return null;
}

function resolveApiUrl(raw: string): string {
  if (!raw.includes('localhost') && !raw.includes('127.0.0.1')) return raw;
  const host = getDevMachineHost();
  if (!host) return raw;
  return raw.replace(/localhost|127\.0\.0\.1/g, host);
}

export const API_URL = resolveApiUrl(process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_API_URL);
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

if (__DEV__) {
  console.log(`[API] base URL: ${API_URL} (mock=${USE_MOCK})`);
}
