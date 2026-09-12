import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

type Props = {
  minutes: number;
};

export function CheckoutEtaBanner({ minutes }: Props) {
  const { colors, typography, radius } = useTheme();

  return (
    <View style={[styles.banner, { backgroundColor: colors.primaryLight, borderRadius: radius.md }]}>
      <Ionicons name="flash" size={16} color={colors.primary} />
      <Text style={[typography.label, { color: colors.primary, flex: 1 }]}>
        {t('deliveryInMinutes', { minutes })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
});
