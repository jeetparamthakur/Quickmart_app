import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import { useLocationStore } from '@/store/locationStore';
import { checkoutService } from '@/services/api/checkout.service';
import { PaymentMethod } from '@/types/cart';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice } from '@/utils/formatPrice';
import { t } from '@/i18n';

const paymentMethods: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'wallet', label: 'Wallet', icon: '👛' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
];

export default function CheckoutScreen() {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const cart = useCart();
  const { savedAddresses, selectedAddress, setSelectedAddress } = useLocationStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;
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
      router.replace({ pathname: '/order-success', params: { orderId: result.orderId, total: String(result.total) } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <TouchableOpacity onPress={() => router.back()} style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: 24, color: colors.text }}>←</Text>
      </TouchableOpacity>
      <Text style={[typography.h2, { color: colors.text, paddingHorizontal: spacing.lg }]}>Checkout</Text>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Delivery Address</Text>
        {savedAddresses.map((addr) => (
          <TouchableOpacity
            key={addr.id}
            onPress={() => setSelectedAddress(addr)}
            style={[
              styles.addrCard,
              shadows.sm,
              {
                backgroundColor: selectedAddress?.id === addr.id ? colors.primaryLight : colors.surface,
                borderRadius: radius.md,
                padding: spacing.lg,
                marginBottom: spacing.sm,
                borderColor: selectedAddress?.id === addr.id ? colors.primary : colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[typography.label, { color: colors.text }]}>{addr.label}</Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {addr.line1}, {addr.city} - {addr.pincode}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={[typography.label, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Delivery Instructions
        </Text>
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Ring the bell, leave at door..."
          placeholderTextColor={colors.textMuted}
          multiline
          style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, color: colors.text, padding: spacing.md }]}
        />

        <Text style={[typography.h3, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
          Payment Method
        </Text>
        {paymentMethods.map((pm) => (
          <TouchableOpacity
            key={pm.id}
            onPress={() => setPaymentMethod(pm.id)}
            style={[
              styles.payCard,
              {
                backgroundColor: paymentMethod === pm.id ? colors.primaryLight : colors.surface,
                borderRadius: radius.md,
                padding: spacing.lg,
                marginBottom: spacing.sm,
                borderColor: paymentMethod === pm.id ? colors.primary : colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={{ fontSize: 20 }}>{pm.icon}</Text>
            <Text style={[typography.body, { color: colors.text, flex: 1, marginLeft: spacing.md }]}>{pm.label}</Text>
            {paymentMethod === pm.id && <Text style={{ color: colors.primary }}>✓</Text>}
          </TouchableOpacity>
        ))}

        <View style={[styles.summary, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.xl, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Order Summary</Text>
          <SummaryRow label="Items" value={`${cart.itemCount} items`} />
          <SummaryRow label="Subtotal" value={formatPrice(cart.subtotal)} />
          <SummaryRow label="Delivery" value={formatPrice(cart.deliveryFee)} />
          <SummaryRow label="Taxes & fees" value={formatPrice(cart.platformFee + cart.tax)} />
          {cart.couponDiscount > 0 && <SummaryRow label="Discount" value={`-${formatPrice(cart.couponDiscount)}`} />}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SummaryRow label="Total" value={formatPrice(cart.total)} bold />
        </View>
      </ScrollView>

      <View style={[styles.footer, shadows.lg, { backgroundColor: colors.surface, padding: spacing.lg, borderTopColor: colors.border, borderTopWidth: 1 }]}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Button title={t('placeOrder')} onPress={handlePlaceOrder} fullWidth size="lg" disabled={!selectedAddress} />
        )}
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[bold ? typography.h3 : typography.bodySmall, { color: colors.text, fontWeight: bold ? '700' : '400' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addrCard: {},
  textArea: { borderWidth: 1, minHeight: 80, textAlignVertical: 'top' },
  payCard: { flexDirection: 'row', alignItems: 'center' },
  summary: {},
  divider: { height: 1, marginVertical: 12 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
