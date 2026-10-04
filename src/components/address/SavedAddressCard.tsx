import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '@/utils/haptics';
import { Address, formatDisplayPhone, hasDeliveryContact } from '@/types/location';
import { useTheme } from '@/context/ThemeContext';
import { PressableScale } from '@/components/ui';
import { t } from '@/i18n';

type Props = {
  address: Address;
  selected?: boolean;
  selectable?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
};

function iconForLabel(label: string): keyof typeof Ionicons.glyphMap {
  const key = label.toLowerCase();
  if (key.includes('home')) return 'home-outline';
  if (key.includes('work') || key.includes('office')) return 'briefcase-outline';
  return 'location-outline';
}

function labelDisplay(label: string): string {
  const key = label.toLowerCase();
  if (key.includes('home')) return t('addressTypeHome');
  if (key.includes('work') || key.includes('office')) return t('addressTypeWork');
  if (key.includes('other')) return t('addressTypeOther');
  return label;
}

function IconAction({
  name,
  color,
  onPress,
  accessibilityLabel,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.iconBtn, { borderRadius: radius.sm, backgroundColor: colors.surfaceSecondary }]}
    >
      <Ionicons name={name} size={18} color={color} />
    </Pressable>
  );
}

export function SavedAddressCard({
  address,
  selected = false,
  selectable = false,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
}: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const contactOk = hasDeliveryContact(address);
  const pad = spacing.sm;

  const handlePress = () => {
    if (!onPress) return;
    Haptics.selectionAsync();
    onPress();
  };

  const body = (
    <View style={[styles.row, { padding: pad, gap: 10 }]}>
      <View
        style={[
          styles.leadIcon,
          {
            backgroundColor: selected ? colors.surface : colors.primaryLight,
            borderRadius: radius.sm,
          },
        ]}
      >
        <Ionicons name={iconForLabel(address.label)} size={18} color={colors.primary} />
      </View>

      <View style={styles.main}>
        <View style={styles.titleRow}>
          <Text style={[typography.caption, { color: colors.text, fontWeight: '800' }]} numberOfLines={1}>
            {labelDisplay(address.label)}
            {address.isDefault ? (
              <Text style={{ color: colors.primary, fontWeight: '700' }}> · {t('defaultAddress')}</Text>
            ) : null}
          </Text>
        </View>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ''}
          {address.city || address.pincode
            ? ` · ${[address.city, address.pincode].filter(Boolean).join(' ')}`
            : ''}
        </Text>
        <Text
          style={[
            typography.caption,
            {
              marginTop: 2,
              fontSize: 11,
              color: contactOk ? colors.textMuted : colors.error,
            },
          ]}
          numberOfLines={1}
        >
          {contactOk
            ? `${address.receiverName.trim()} · ${formatDisplayPhone(address.receiverPhone)}`
            : t('contactMissing')}
        </Text>
      </View>

      <View style={styles.trailing}>
        {showActions ? (
          <View style={styles.iconActions}>
            {onEdit ? (
              <IconAction name="create-outline" color={colors.text} onPress={onEdit} accessibilityLabel={t('edit')} />
            ) : null}
            {onDelete ? (
              <IconAction
                name="trash-outline"
                color={colors.error}
                onPress={onDelete}
                accessibilityLabel={t('deleteAddress')}
              />
            ) : null}
          </View>
        ) : null}
        {selectable ? (
          <View
            style={[
              styles.radio,
              {
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.primary : 'transparent',
              },
            ]}
          >
            {selected ? <Ionicons name="checkmark" size={11} color="#FFF" /> : null}
          </View>
        ) : null}
      </View>
    </View>
  );

  const cardStyle = [
    styles.card,
    shadows.sm,
    {
      backgroundColor: selected ? colors.primaryLight : colors.surface,
      borderRadius: radius.md,
      marginBottom: spacing.sm,
      borderWidth: selected ? 1.5 : StyleSheet.hairlineWidth,
      borderColor: selected ? colors.primary : colors.border,
    },
  ];

  if (selectable && onPress) {
    return (
      <PressableScale onPress={handlePress} haptic="selection" style={cardStyle}>
        {body}
      </PressableScale>
    );
  }

  return <View style={cardStyle}>{body}</View>;
}

const styles = StyleSheet.create({
  card: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
