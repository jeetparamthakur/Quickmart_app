import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/context/ThemeContext';
import { NetworkBanner } from '@/components/ui/NetworkBanner';
import { setOnUnauthorized } from '@/services/api/client';
import { useAuthStore } from '@/store/authStore';
import { useAddressSync } from '@/hooks/useAddressSync';
import { useWishlistSync } from '@/hooks/useWishlistSync';

function AuthSessionSync() {
  const logout = useAuthStore((s) => s.logout);
  useAddressSync();
  useWishlistSync();

  useEffect(() => {
    setOnUnauthorized(() => {
      void logout().then(() => router.replace('/(auth)/login'));
    });
    return () => setOnUnauthorized(null);
  }, [logout]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthSessionSync />
          <NetworkBanner />
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)/location" />
            <Stack.Screen
              name="(onboarding)/location-map"
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="product/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="store/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="category/[slug]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="addresses" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="my-account" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="help-support" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="wishlist" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="orders" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="order/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="order/[id]/track" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="checkout" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="order-success" options={{ animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="placeholder/[screen]" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
