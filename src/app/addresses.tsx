import { useCallback, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ui';
import { SavedAddressCard, AddAddressBanner, DeleteAddressSheet } from '@/components/address';
import { useLocationStore } from '@/store/locationStore';
import { useTheme } from '@/context/ThemeContext';
import { addressService } from '@/services/api/address.service';
import { getErrorMessage } from '@/services/api/errors';
import { Address } from '@/types/location';
import { t } from '@/i18n';
import * as Haptics from '@/utils/haptics';

export default function SavedAddressesScreen() {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const savedAddresses = useLocationStore((s) => s.savedAddresses);
  const removeAddress = useLocationStore((s) => s.removeAddress);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openAdd = () => {
    router.push({ pathname: '/(onboarding)/location-map', params: { saveOnly: '1', label: 'Home' } });
  };

  const openEdit = (id: string) => {
    router.push({
      pathname: '/(onboarding)/location-map',
      params: { saveOnly: '1', addressId: id },
    });
  };

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteLoading(true);
    setBusyId(id);
    const snapshot = useLocationStore.getState().savedAddresses;
    removeAddress(id);
    try {
      await addressService.remove(id);
      setDeleteTarget(null);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      useLocationStore.getState().setSavedAddresses(snapshot);
      setDeleteTarget(null);
      Alert.alert(t('deleteAddress'), getErrorMessage(err, t('deleteAddressFailed')));
    } finally {
      setDeleteLoading(false);
      setBusyId(null);
    }
  }, [deleteTarget, removeAddress]);

  const countLabel = savedAddresses.length
    ? t('savedAddressCount').replace('{count}', String(savedAddresses.length))
    : '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={t('savedAddresses')} showBack />
      <FlatList
        data={savedAddresses}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xxl * 2,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            {countLabel ? (
              <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                {countLabel}
              </Text>
            ) : null}
            <AddAddressBanner onPress={openAdd} />
            {savedAddresses.length > 0 ? (
              <Text style={[typography.caption, { color: colors.textMuted, fontWeight: '700', letterSpacing: 0.6 }]}>
                {t('yourAddresses').toUpperCase()}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.empty, { paddingVertical: spacing.xxl }]}>
            <View style={[styles.emptyIcon, shadows.md, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
              <Ionicons name="map-outline" size={40} color={colors.primary} />
            </View>
            <Text style={[typography.h3, { color: colors.text, marginTop: spacing.lg, fontWeight: '800', textAlign: 'center' }]}>
              {t('noSavedAddresses')}
            </Text>
            <Text
              style={[
                typography.bodySmall,
                { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center', maxWidth: 280 },
              ]}
            >
              {t('addAddressHint')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <SavedAddressCard
            address={item}
            showActions
            onEdit={() => openEdit(item.id)}
            onDelete={busyId === item.id ? undefined : () => setDeleteTarget(item)}
          />
        )}
      />

      <DeleteAddressSheet
        visible={deleteTarget !== null}
        address={deleteTarget}
        loading={deleteLoading}
        onClose={() => {
          if (!deleteLoading) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { alignItems: 'center', paddingHorizontal: 24 },
  emptyIcon: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
