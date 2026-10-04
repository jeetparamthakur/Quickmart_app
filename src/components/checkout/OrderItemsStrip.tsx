import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '@/utils/haptics';
import { CartItem } from '@/types/cart';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

type Props = {
  items: CartItem[];
};

const PREVIEW = 4;

export function OrderItemsStrip({ items }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const preview = items.slice(0, PREVIEW);
  const extra = Math.max(0, items.length - PREVIEW);
  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        router.back();
      }}
      style={[
        styles.card,
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
          marginBottom: spacing.lg,
        },
      ]}
    >
      <View style={styles.thumbs}>
        {preview.map((item, i) => (
          <Image
            key={item.id}
            source={{ uri: item.product.image }}
            style={[
              styles.thumb,
              {
                marginLeft: i === 0 ? 0 : -10,
                zIndex: preview.length - i,
                borderColor: colors.surface,
                backgroundColor: colors.surfaceSecondary,
              },
            ]}
          />
        ))}
        {extra > 0 ? (
          <View
            style={[
              styles.more,
              {
                marginLeft: -10,
                backgroundColor: colors.primaryLight,
                borderColor: colors.surface,
              },
            ]}
          >
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '800' }]}>+{extra}</Text>
          </View>
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.label, { color: colors.text }]}>
          {count} {count === 1 ? t('item') : t('items')}
        </Text>
        <Text style={[typography.caption, { color: colors.primary, fontWeight: '700', marginTop: 2 }]}>
          {t('reviewCart')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumbs: { flexDirection: 'row', alignItems: 'center' },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
  },
  more: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
