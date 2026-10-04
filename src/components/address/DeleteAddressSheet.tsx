import { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '@/utils/haptics';
import { Address, formatDisplayPhone, hasDeliveryContact } from '@/types/location';
import { useTheme } from '@/context/ThemeContext';
import { Button, PressableScale } from '@/components/ui';
import { t } from '@/i18n';

type Props = {
  visible: boolean;
  address: Address | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function iconForLabel(label: string): keyof typeof Ionicons.glyphMap {
  const key = label.toLowerCase();
  if (key.includes('home')) return 'home-outline';
  if (key.includes('work') || key.includes('office')) return 'briefcase-outline';
  return 'location-outline';
}

export function DeleteAddressSheet({ visible, address, loading = false, onClose, onConfirm }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [visible]);

  if (!address) return null;

  const contactOk = hasDeliveryContact(address);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(180)}
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={loading ? undefined : onClose} accessibilityLabel={t('cancel')} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(280)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.sheet,
            shadows.lg,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.lg + 4,
              borderTopRightRadius: radius.lg + 4,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={[styles.iconRing, { backgroundColor: colors.errorLight }]}>
            <View style={[styles.iconInner, { backgroundColor: colors.surface }]}>
              <Ionicons name="trash-outline" size={28} color={colors.error} />
            </View>
          </View>

          <Text style={[typography.h3, { color: colors.text, textAlign: 'center', fontWeight: '800', marginTop: spacing.md }]}>
            {t('deleteAddressTitle')}
          </Text>
          <Text
            style={[
              typography.bodySmall,
              { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.lg },
            ]}
          >
            {t('deleteAddressConfirm')}
          </Text>

          <View
            style={[
              styles.preview,
              {
                marginTop: spacing.lg,
                marginHorizontal: spacing.lg,
                backgroundColor: colors.surfaceSecondary,
                borderRadius: radius.md,
                borderColor: colors.border,
                padding: spacing.md,
              },
            ]}
          >
            <View style={styles.previewRow}>
              <View style={[styles.previewIcon, { backgroundColor: colors.primaryLight, borderRadius: radius.sm }]}>
                <Ionicons name={iconForLabel(address.label)} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[typography.label, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>
                  {address.label}
                  {address.isDefault ? ` · ${t('defaultAddress')}` : ''}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={2}>
                  {address.line1}
                  {address.city ? `, ${address.city}` : ''}
                  {address.pincode ? ` - ${address.pincode}` : ''}
                </Text>
                {contactOk ? (
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]} numberOfLines={1}>
                    {address.receiverName} · {formatDisplayPhone(address.receiverPhone)}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl, gap: spacing.sm }}>
            <PressableScale
              onPress={onConfirm}
              disabled={loading}
              haptic="medium"
              style={[
                styles.deleteBtn,
                shadows.sm,
                {
                  backgroundColor: colors.error,
                  borderRadius: radius.md,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <View style={styles.deleteBtnInner}>
                  <Ionicons name="trash" size={18} color="#FFF" />
                  <Text style={[typography.label, { color: '#FFF', fontWeight: '800', marginLeft: 8 }]}>
                    {t('deleteAddress')}
                  </Text>
                </View>
              )}
            </PressableScale>

            <Button title={t('keepAddress')} variant="ghost" fullWidth onPress={onClose} disabled={loading} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingTop: 10,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacingHandle,
  },
  iconRing: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  previewIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  deleteBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const spacingHandle = 8;
