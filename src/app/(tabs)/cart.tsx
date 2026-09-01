import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, EmptyState } from '@/components/ui';
import { CartGroupSection } from '@/components/cart/CartGroup';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCart } from '@/hooks/useCart';
import { checkoutService } from '@/services/api/checkout.service';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';
import { useState } from 'react';

export default function CartScreen() {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const cart = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  if (cart.itemCount === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Text style={[typography.h2, { color: colors.text, padding: spacing.lg }]}>{t('cart')}</Text>
        <EmptyState
          title={t('emptyCartTitle')}
          subtitle={t('emptyCartSubtitle')}
          actionLabel={t('browseProducts')}
          onAction={() => router.push('/(tabs)')}
        />
      </SafeAreaView>
    );
  }

  const applyCoupon = () => {
    const result = checkoutService.validateCoupon(couponInput, cart.subtotal);
    if (result.valid) {
      cart.applyCoupon(couponInput.toUpperCase(), result.discount);
    }
    setCouponMsg(result.message);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[typography.h2, { color: colors.text, padding: spacing.lg }]}>MY CART</Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 120 }}>
        {cart.groups.map((group) => (
          <CartGroupSection
            key={group.storeId}
            group={group}
            onRemove={cart.removeItem}
            onUpdateQuantity={cart.updateQuantity}
          />
        ))}

        <View style={[styles.coupon, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderColor: colors.border, borderWidth: 1 }]}>
          <TextInput
            value={couponInput}
            onChangeText={setCouponInput}
            placeholder="Enter coupon (SAVE10, FLAT50, WELCOME)"
            placeholderTextColor={colors.textMuted}
            style={[typography.body, { color: colors.text, flex: 1 }]}
            autoCapitalize="characters"
          />
          <TouchableOpacity onPress={applyCoupon}>
            <Text style={[typography.label, { color: colors.primary }]}>Apply</Text>
          </TouchableOpacity>
        </View>
        {couponMsg ? (
          <Text style={[typography.caption, { color: cart.couponDiscount > 0 ? colors.success : colors.error, marginTop: spacing.sm }]}>
            {couponMsg}
          </Text>
        ) : null}

        <View style={{ marginTop: spacing.lg }}>
          <CartSummary
            subtotal={cart.subtotal}
            deliveryFee={cart.deliveryFee}
            platformFee={cart.platformFee}
            tax={cart.tax}
            couponDiscount={cart.couponDiscount}
            savings={cart.savings}
            total={cart.total}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, shadows.lg, { backgroundColor: colors.surface, padding: spacing.lg, borderTopColor: colors.border, borderTopWidth: 1 }]}>
        <Button title={t('proceedToCheckout')} onPress={() => router.push('/checkout')} fullWidth size="lg" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  coupon: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
