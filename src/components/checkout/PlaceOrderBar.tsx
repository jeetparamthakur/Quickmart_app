import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice } from '@/utils/formatPrice';
import { t } from '@/i18n';

type Props = {
  total: number;
  itemCount: number;
  loading: boolean;
  disabled: boolean;
  onPlaceOrder: () => void;
};

export function PlaceOrderBar({ total, itemCount, loading, disabled, onPlaceOrder }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const blocked = disabled || loading;

  return (
    <View
      style={[
        styles.footer,
        shadows.lg,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          padding: spacing.md,
          paddingBottom: Math.max(insets.bottom, spacing.md),
        },
      ]}
    >
      {disabled && !loading ? (
        <Text style={[typography.caption, { color: colors.error, marginBottom: 8, fontWeight: '600' }]}>
          {t('addressRequired')}
        </Text>
      ) : null}
      <Pressable
        disabled={blocked}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPlaceOrder();
        }}
        style={{ opacity: blocked ? 0.65 : 1 }}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cta, { borderRadius: radius.lg }]}
        >
          <View>
            <Text style={[typography.h3, { color: '#FFF', fontWeight: '800' }]}>{formatPrice(total)}</Text>
            <Text style={[typography.caption, { color: 'rgba(255,255,255,0.85)', marginTop: 2 }]}>
              {itemCount} {itemCount === 1 ? t('item') : t('items')} · {t('inclTaxes')}
            </Text>
          </View>
          <View style={styles.ctaLabel}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={[typography.label, { color: '#FFF', fontWeight: '800' }]}>{t('placeOrder')}</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </>
            )}
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ctaLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '52%', minHeight: 24 },
});
