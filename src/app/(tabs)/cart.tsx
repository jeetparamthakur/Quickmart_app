import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from '@/utils/haptics';
import { CartGroupSection } from '@/components/cart/CartGroup';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCart } from '@/hooks/useCart';
import { useCartPricing } from '@/hooks/useCartPricing';
import { checkoutService } from '@/services/api/checkout.service';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';
import { formatPrice } from '@/utils/formatPrice';

const SUGGESTED_COUPONS = ['SAVE10', 'FLAT50', 'WELCOME'];

export default function CartScreen() {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const cart = useCart();
  const pricing = useCartPricing();
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  const applyCoupon = async (code?: string) => {
    const raw = (code ?? couponInput).trim();
    if (!raw) return;
    const result = await checkoutService.validateCoupon(raw, cart.items, cart.subtotal);
    if (result.valid) {
      cart.applyCoupon(raw.toUpperCase(), result.discount);
      setCouponInput('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setCouponMsg(result.message);
  };

  const confirmClear = () => {
    Alert.alert(t('clearCart'), t('clearCartConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('clear'),
        style: 'destructive',
        onPress: () => {
          cart.clearCart();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  if (cart.itemCount === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
          <Text style={[typography.h2, { color: colors.text, fontWeight: '800', letterSpacing: -0.4 }]}>
            {t('cart')}
          </Text>
        </View>
        <Animated.View entering={FadeIn.duration(280)} style={styles.emptyWrap}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="bag-handle-outline" size={42} color={colors.primary} />
          </View>
          <Text style={[typography.h3, { color: colors.text, textAlign: 'center', marginTop: spacing.lg }]}>
            {t('emptyCartTitle')}
          </Text>
          <Text
            style={[
              typography.bodySmall,
              { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: 28 },
            ]}
          >
            {t('emptyCartSubtitle')}
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(tabs)');
            }}
            style={[shadows.md, { marginTop: spacing.xxl, borderRadius: radius.lg }]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.emptyCta, { borderRadius: radius.lg }]}
            >
              <Text style={[typography.label, { color: '#FFF', fontWeight: '800' }]}>{t('browseProducts')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h2, { color: colors.text, fontWeight: '800', letterSpacing: -0.4 }]}>
            {t('cart')}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {cart.itemCount} {cart.itemCount === 1 ? t('item') : t('items')}
          </Text>
        </View>
        {cart.savings > 0 ? (
          <View style={[styles.savePill, { backgroundColor: colors.successLight }]}>
            <Ionicons name="sparkles" size={12} color={colors.success} />
            <Text style={[typography.caption, { color: colors.success, fontWeight: '700' }]}>
              {t('youSaved', { amount: formatPrice(cart.savings) })}
            </Text>
          </View>
        ) : null}
        <Pressable onPress={confirmClear} hitSlop={8} style={[styles.clearBtn, { backgroundColor: colors.errorLight }]}>
          <Ionicons name="trash-outline" size={16} color={colors.error} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
      >
        {cart.groups.map((group, i) => (
          <Animated.View key={group.storeId} entering={FadeInDown.delay(60 * i).duration(280)}>
            <CartGroupSection
              group={group}
              onRemove={cart.removeItem}
              onUpdateQuantity={cart.updateQuantity}
            />
          </Animated.View>
        ))}

        <Animated.View
          entering={FadeInDown.delay(120).duration(280)}
          style={[
            styles.couponCard,
            shadows.sm,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderColor: colors.border,
              padding: spacing.md,
            },
          ]}
        >
          <View style={styles.couponHead}>
            <Ionicons name="ticket-outline" size={18} color={colors.primary} />
            <Text style={[typography.label, { color: colors.text }]}>{t('applyCoupon')}</Text>
          </View>

          {cart.couponCode ? (
            <View style={[styles.applied, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={[typography.label, { color: colors.success, flex: 1 }]}>
                {cart.couponCode} · {t('youSaved', { amount: formatPrice(pricing.couponDiscount || cart.couponDiscount) })}
              </Text>
              <Pressable
                onPress={() => {
                  void checkoutService.clearCoupon(cart.items);
                  cart.clearCoupon();
                  setCouponMsg('');
                }}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={18} color={colors.success} />
              </Pressable>
            </View>
          ) : (
            <>
              <View style={[styles.couponRow, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md }]}>
                <TextInput
                  value={couponInput}
                  onChangeText={setCouponInput}
                  placeholder={t('couponPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  style={[typography.bodySmall, { color: colors.text, flex: 1, paddingVertical: 10 }]}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => applyCoupon()}
                />
                <Pressable
                  onPress={() => applyCoupon()}
                  style={[styles.applyBtn, { backgroundColor: colors.primary, borderRadius: radius.sm }]}
                >
                  <Text style={[typography.caption, { color: '#FFF', fontWeight: '800' }]}>{t('apply')}</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {SUGGESTED_COUPONS.map((code) => (
                  <Pressable
                    key={code}
                    onPress={() => applyCoupon(code)}
                    style={[
                      styles.chip,
                      {
                        borderColor: couponInput.toUpperCase() === code ? colors.primary : colors.border,
                        backgroundColor: couponInput.toUpperCase() === code ? colors.primaryLight : colors.background,
                      },
                    ]}
                  >
                    <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>{code}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}
          {couponMsg && !cart.couponCode ? (
            <Text style={[typography.caption, { color: colors.error, marginTop: spacing.sm }]}>{couponMsg}</Text>
          ) : null}
        </Animated.View>

        <View style={{ marginTop: spacing.lg }}>
          <CartSummary
            subtotal={pricing.subtotal}
            deliveryFee={pricing.deliveryFee}
            charges={pricing.charges}
            platformFee={pricing.platformFee}
            tax={pricing.tax}
            couponDiscount={pricing.couponDiscount || cart.couponDiscount}
            savings={pricing.savings}
            total={pricing.total}
          />
        </View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.springify().damping(16)}
        style={[
          styles.footer,
          shadows.lg,
          { backgroundColor: colors.surface, borderTopColor: colors.border, padding: spacing.md },
        ]}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/checkout');
          }}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.checkout, { borderRadius: radius.lg }]}
          >
            <View>
              <Text style={[typography.h3, { color: '#FFF', fontWeight: '800' }]}>{formatPrice(pricing.total)}</Text>
              <Text style={[typography.caption, { color: 'rgba(255,255,255,0.85)', marginTop: 2 }]}>
                {cart.itemCount} {cart.itemCount === 1 ? t('item') : t('items')} · {t('inclTaxes')}
              </Text>
            </View>
            <View style={styles.checkoutCta}>
              <Text style={[typography.label, { color: '#FFF', fontWeight: '800' }]}>{t('proceedToCheckout')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
    paddingBottom: 12,
  },
  savePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: 160,
  },
  clearBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponCard: { borderWidth: StyleSheet.hairlineWidth },
  couponHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    gap: 8,
  },
  applyBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  chips: { flexDirection: 'row', gap: 8, marginTop: 12, paddingRight: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  applied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
  checkout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  checkoutCta: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '52%' },
});
