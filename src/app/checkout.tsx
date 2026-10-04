import { useEffect, useMemo, useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from '@/utils/haptics';
import {
  AddressPicker,
  CheckoutEtaBanner,
  CheckoutHeader,
  CheckoutStepIndicator,
  DeliveryNotes,
  OrderItemsStrip,
  PaymentMethodList,
  PlaceOrderBar,
} from '@/components/checkout';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCart } from '@/hooks/useCart';
import { useCartPricing } from '@/hooks/useCartPricing';
import { useLocationStore } from '@/store/locationStore';
import { checkoutService } from '@/services/api/checkout.service';
import { PaymentMethod } from '@/types/cart';
import { hasDeliveryContact } from '@/types/location';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

export default function CheckoutScreen() {
  const { colors, spacing } = useTheme();
  const cart = useCart();
  const pricing = useCartPricing();
  const { savedAddresses, selectedAddress, setSelectedAddress } = useLocationStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart.itemCount === 0) {
      router.replace('/(tabs)/cart');
    }
  }, [cart.itemCount]);

  useEffect(() => {
    if (selectedAddress || savedAddresses.length === 0) return;
    const fallback = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
    setSelectedAddress(fallback);
  }, [savedAddresses, selectedAddress, setSelectedAddress]);

  const eta = useMemo(() => {
    const minutes = cart.items.map((i) => i.product.sellers?.[0]?.deliveryMinutes ?? 10);
    return minutes.length ? Math.min(...minutes) : 10;
  }, [cart.items]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;
    if (!hasDeliveryContact(selectedAddress)) {
      Alert.alert(t('contactMissing'), t('invalidReceiverPhone'));
      return;
    }
    setLoading(true);
    try {
      const result = await checkoutService.placeOrder({
        items: cart.items,
        addressId: selectedAddress.id,
        paymentMethod,
        deliveryInstructions: instructions,
        couponCode: cart.couponCode ?? undefined,
      });
      cart.clearCart();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: '/order-success',
        params: {
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          total: String(result.total),
          etaMinutes: String(result.estimatedDeliveryMinutes),
        },
      });
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('placeOrderFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (cart.itemCount === 0) {
    return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <CheckoutHeader itemCount={cart.itemCount} />
      <CheckoutStepIndicator />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 148 }}
        >
          <Animated.View entering={FadeInDown.duration(280)}>
            <CheckoutEtaBanner minutes={eta} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(40).duration(280)}>
            <AddressPicker
              addresses={savedAddresses}
              selectedId={selectedAddress?.id}
              onSelect={setSelectedAddress}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(280)}>
            <OrderItemsStrip items={cart.items} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(280)}>
            <PaymentMethodList value={paymentMethod} onChange={setPaymentMethod} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(280)}>
            <DeliveryNotes value={instructions} onChange={setInstructions} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(280)}>
            <View style={{ marginBottom: spacing.lg }}>
              <CartSummary
                subtotal={pricing.subtotal}
                deliveryFee={pricing.deliveryFee}
                charges={pricing.charges}
                platformFee={pricing.platformFee}
                tax={pricing.tax}
                couponDiscount={cart.couponDiscount}
                savings={pricing.savings}
                total={pricing.total}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Animated.View entering={FadeInUp.springify().damping(16)}>
        <PlaceOrderBar
          total={pricing.total}
          itemCount={cart.itemCount}
          loading={loading}
          disabled={!selectedAddress || !hasDeliveryContact(selectedAddress)}
          onPlaceOrder={handlePlaceOrder}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
