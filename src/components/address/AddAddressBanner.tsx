import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { PressableScale } from '@/components/ui';
import { t } from '@/i18n';

type Props = {
  onPress: () => void;
  compact?: boolean;
};

export function AddAddressBanner({ onPress, compact = false }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();

  if (compact) {
    return (
      <PressableScale
        onPress={onPress}
        haptic="medium"
        style={[
          styles.compactRow,
          shadows.sm,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderColor: colors.primary,
            padding: spacing.md,
            marginBottom: spacing.md,
          },
        ]}
      >
        <View style={[styles.plusCircle, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="add" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.label, { color: colors.text, fontWeight: '800' }]}>{t('addNewAddress')}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {t('addAddressHint')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </PressableScale>
    );
  }

  return (
    <PressableScale onPress={onPress} haptic="medium" style={[styles.wrap, { marginBottom: spacing.lg }]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, shadows.md, { borderRadius: radius.lg }]}
      >
        <View style={styles.gradientInner}>
          <View style={styles.iconBadge}>
            <Ionicons name="location" size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.label, { color: '#FFF', fontWeight: '800', fontSize: 16 }]}>
              {t('addNewAddress')}
            </Text>
            <Text style={[typography.caption, { color: 'rgba(255,255,255,0.88)', marginTop: 4 }]}>
              {t('addAddressHint')}
            </Text>
          </View>
          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </View>
        </View>
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  gradient: { padding: 16 },
  gradientInner: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  plusCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
