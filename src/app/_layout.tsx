import { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { ThemeProvider } from '@/context/ThemeContext';
import { NetworkBanner } from '@/components/ui/NetworkBanner';
import { setOnUnauthorized } from '@/services/api/client';
import { useAuthStore } from '@/store/authStore';
import { useAddressSync } from '@/hooks/useAddressSync';
import { useWishlistSync } from '@/hooks/useWishlistSync';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AuthSessionSync() {
  const logout = useAuthStore((s) => s.logout);
  useAddressSync();
  useWishlistSync();

  useEffect(() => {
    setOnUnauthorized(async () => {
      await logout();
      router.replace('/(auth)/login');
    });
    return () => setOnUnauthorized(null);
  }, [logout]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <ThemeProvider>
          <View style={{ flex: 1 }}>
            <AuthSessionSync />
            <NetworkBanner />
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)/your-name" />
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
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
