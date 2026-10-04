import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '@/utils/haptics';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

type Props = {
  itemCount: number;
};

export function CheckoutHeader({ itemCount }: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          router.back();
        }}
        hitSlop={8}
        style={[styles.back, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={[typography.h2, { color: colors.text, fontWeight: '800', letterSpacing: -0.4 }]}>
          {t('checkout')}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {itemCount} {itemCount === 1 ? t('item') : t('items')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 12,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
