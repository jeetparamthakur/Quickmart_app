import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, PressableScale } from '@/components/ui';
import { AddressSearchInput } from '@/components/location';
import { SavedAddressCard, AddAddressBanner } from '@/components/address';
import { useLocationStore } from '@/store/locationStore';
import { useTheme } from '@/context/ThemeContext';
import type { AddressResult } from '@/utils/address';
import { t } from '@/i18n';

function openMap(params: Record<string, string>) {
  router.push({
    pathname: '/(onboarding)/location-map',
    params,
  });
}

export default function LocationScreen() {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const { savedAddresses, setSelectedAddress, selectedAddress } = useLocationStore();

  const selectAddress = (address: (typeof savedAddresses)[0]) => {
    setSelectedAddress(address);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSearchSelect = (result: AddressResult) => {
    openMap({
      lat: String(result.latitude),
      lng: String(result.longitude),
    });
  };

  const detectLocation = () => {
    openMap({ autoGps: '1' });
  };

  const pickOnMap = () => {
    openMap({});
  };

  const addNewAddress = () => {
    openMap({ saveOnly: '1', label: 'Home' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={t('selectLocation')} gradient />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm }}>
        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
          We need your location to show nearby stores and products
        </Text>

        <PressableScale
          onPress={detectLocation}
          haptic="medium"
          style={[
            styles.detectBtn,
            shadows.md,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <Ionicons name="locate" size={22} color="#FFF" />
          <Text style={[typography.label, { color: '#FFF', marginLeft: spacing.md, fontWeight: '800' }]}>
            {t('detectLocation')}
          </Text>
        </PressableScale>

        <PressableScale
          onPress={pickOnMap}
          haptic="light"
          style={[
            styles.detectBtn,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.lg,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="map-outline" size={22} color={colors.primary} />
          <Text style={[typography.label, { color: colors.primary, marginLeft: spacing.md, fontWeight: '700' }]}>
            Pick on map
          </Text>
        </PressableScale>

        <AddressSearchInput placeholder={t('searchLocation')} onSelect={handleSearchSelect} />

        <View style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
          <Text style={[typography.h3, { color: colors.text, fontWeight: '800' }]}>{t('savedAddresses')}</Text>
          {savedAddresses.length > 0 ? (
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
              {t('savedAddressCount').replace('{count}', String(savedAddresses.length))}
            </Text>
          ) : null}
        </View>

        <AddAddressBanner compact onPress={addNewAddress} />

        {savedAddresses.map((addr) => (
          <SavedAddressCard
            key={addr.id}
            address={addr}
            selectable
            selected={selectedAddress?.id === addr.id}
            onPress={() => selectAddress(addr)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  detectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
