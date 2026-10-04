import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '@/utils/haptics';
import { Address } from '@/types/location';
import { SavedAddressCard, AddAddressBanner } from '@/components/address';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

type Props = {
  addresses: Address[];
  selectedId?: string;
  onSelect: (address: Address) => void;
};

export function AddressPicker({ addresses, selectedId, onSelect }: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={{ marginBottom: spacing.sm }}>
        <Text style={[typography.label, { color: colors.text, fontSize: 16, fontWeight: '800' }]}>
          {t('deliveryAddress')}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {t('addAddressHint')}
        </Text>
      </View>

      <AddAddressBanner
        compact
        onPress={() => {
          Haptics.selectionAsync();
          router.push('/(onboarding)/location');
        }}
      />

      {addresses.length === 0 ? (
        <Pressable
          onPress={() => router.push('/(onboarding)/location')}
          style={[
            styles.empty,
            {
              backgroundColor: colors.surfaceSecondary,
              borderRadius: radius.lg,
              padding: spacing.md,
            },
          ]}
        >
          <Ionicons name="location-outline" size={28} color={colors.primary} />
          <Text style={[typography.bodySmall, { color: colors.textSecondary, flex: 1, marginLeft: spacing.sm }]}>
            {t('addressRequired')}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      ) : (
        addresses.map((addr) => (
          <SavedAddressCard
            key={addr.id}
            address={addr}
            selectable
            selected={selectedId === addr.id}
            onPress={() => onSelect(addr)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
