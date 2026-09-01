import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Store } from '@/types/store';
import { useTheme } from '@/context/ThemeContext';
import { Badge } from '@/components/ui';
import { formatPrice, formatDistance } from '@/utils/formatPrice';

type Props = {
  store: Store;
  width?: number | `${number}%`;
};

export const StoreCard = memo(function StoreCard({ store, width }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const cardWidth = width ?? '100%';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/store/${store.id}`)}
      style={[styles.card, shadows.md, { width: cardWidth, backgroundColor: colors.surface, borderRadius: radius.md, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth, marginBottom: width ? 0 : 12 }]}
    >
      <Image source={{ uri: store.image }} style={[styles.image, { borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md }]} contentFit="cover" />
      <View style={{ padding: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Image source={{ uri: store.logo }} style={styles.logo} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={[typography.label, { color: colors.text }]} numberOfLines={1}>{store.name}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              ⭐ {store.rating} · {store.deliveryMinutes} min · {formatDistance(store.distanceKm)}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' }}>
          {!store.isOpen && <Badge label="Closed" variant="error" />}
          {store.offer && <Badge label={store.offer} variant="accent" />}
          {store.deliveryFee === 0 ? (
            <Badge label="Free delivery" variant="success" />
          ) : (
            <Badge label={`Delivery ${formatPrice(store.deliveryFee)}`} variant="neutral" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { overflow: 'hidden', marginRight: 12 },
  image: { height: 100, width: '100%' },
  logo: { width: 36, height: 36, borderRadius: 8 },
});
