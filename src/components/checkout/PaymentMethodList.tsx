import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '@/utils/haptics';
import { PaymentMethod } from '@/types/cart';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

type Props = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

const METHODS: {
  id: PaymentMethod;
  label: 'payCod';
  hint: 'payCodHint';
  icon: keyof typeof Ionicons.glyphMap;
}[] = [{ id: 'cod', label: 'payCod', hint: 'payCodHint', icon: 'cash-outline' }];

export function PaymentMethodList({ value, onChange }: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={[typography.label, { color: colors.text, fontSize: 15, marginBottom: 12 }]}>
        {t('paymentMethod')}
      </Text>
      {METHODS.map((pm) => {
        const selected = value === pm.id;
        return (
          <Pressable
            key={pm.id}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(pm.id);
            }}
            style={[
              styles.row,
              {
                backgroundColor: selected ? colors.primaryLight : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: selected ? colors.surface : colors.surfaceSecondary }]}>
              <Ionicons name={pm.icon} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.label, { color: colors.text }]}>{t(pm.label)}</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>{t(pm.hint)}</Text>
            </View>
            <View
              style={[
                styles.radio,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primary : 'transparent',
                },
              ]}
            >
              {selected ? <Ionicons name="checkmark" size={12} color="#FFF" /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
