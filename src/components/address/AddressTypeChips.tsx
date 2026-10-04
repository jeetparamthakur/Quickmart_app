import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { PressableScale } from '@/components/ui';
import { t } from '@/i18n';

export const ADDRESS_TYPES = ['Home', 'Work', 'Other'] as const;
export type AddressType = (typeof ADDRESS_TYPES)[number];

const TYPE_ICONS: Record<AddressType, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Work: 'briefcase-outline',
  Other: 'navigate-outline',
};

type Props = {
  value: string;
  onChange: (label: AddressType) => void;
};

export function AddressTypeChips({ value, onChange }: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const normalized = ADDRESS_TYPES.includes(value as AddressType) ? (value as AddressType) : 'Home';

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700' }]}>{t('saveAs')}</Text>
      <View
        style={[
          styles.segmented,
          {
            backgroundColor: colors.surfaceSecondary,
            borderRadius: radius.md,
            padding: 4,
          },
        ]}
      >
        {ADDRESS_TYPES.map((type) => {
          const selected = normalized === type;
          const label =
            type === 'Home' ? t('addressTypeHome') : type === 'Work' ? t('addressTypeWork') : t('addressTypeOther');
          return (
            <PressableScale
              key={type}
              onPress={() => onChange(type)}
              haptic="selection"
              style={[
                styles.segment,
                {
                  borderRadius: radius.sm,
                  backgroundColor: selected ? colors.surface : 'transparent',
                  flex: 1,
                },
                selected ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 } : null,
              ]}
            >
              <Ionicons name={TYPE_ICONS[type]} size={16} color={selected ? colors.primary : colors.textMuted} />
              <Text
                style={[
                  typography.caption,
                  {
                    color: selected ? colors.primary : colors.textSecondary,
                    fontWeight: '700',
                    marginTop: 2,
                  },
                ]}
              >
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  segmented: { flexDirection: 'row', gap: 4 },
  segment: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
});
