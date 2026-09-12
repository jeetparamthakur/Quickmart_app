import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Address } from '@/types/location';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

type Props = {
  addresses: Address[];
  selectedId?: string;
  onSelect: (address: Address) => void;
};

function iconForLabel(label: string): keyof typeof Ionicons.glyphMap {
  const key = label.toLowerCase();
  if (key.includes('home')) return 'home-outline';
  if (key.includes('work') || key.includes('office')) return 'briefcase-outline';
  return 'location-outline';
}

export function AddressPicker({ addresses, selectedId, onSelect }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={styles.sectionHead}>
        <Text style={[typography.label, { color: colors.text, fontSize: 15 }]}>{t('deliveryAddress')}</Text>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.push('/(onboarding)/location');
          }}
          hitSlop={8}
          style={styles.addRow}
        >
          <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>{t('addAddress')}</Text>
        </Pressable>
      </View>

      {addresses.length === 0 ? (
        <Pressable
          onPress={() => router.push('/(onboarding)/location')}
          style={[
            styles.empty,
            shadows.sm,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Ionicons name="map-outline" size={22} color={colors.primary} />
          <Text style={[typography.bodySmall, { color: colors.textSecondary, flex: 1 }]}>
            {t('addressRequired')}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      ) : (
        addresses.map((addr) => {
          const selected = selectedId === addr.id;
          return (
            <Pressable
              key={addr.id}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(addr);
              }}
              style={[
                styles.card,
                shadows.sm,
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
                <Ionicons name={iconForLabel(addr.label)} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.labelRow}>
                  <Text style={[typography.label, { color: colors.text }]}>{addr.label}</Text>
                  {addr.isDefault ? (
                    <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
                      <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                        {t('defaultAddress')}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={2}>
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ''}
                  {` · ${addr.city} ${addr.pincode}`}
                </Text>
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
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
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
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
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
