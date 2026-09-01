import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheet, Button } from '@/components/ui';
import { SearchFilters } from '@/services/api/product.service';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  visible: boolean;
  filters: SearchFilters;
  onClose: () => void;
  onChange: (filters: SearchFilters) => void;
  onApply: () => void;
};

export function FilterSheet({ visible, filters, onClose, onChange, onApply }: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  const toggle = (key: keyof SearchFilters, value: unknown, activeValue: unknown) => {
    onChange({ ...filters, [key]: filters[key] === activeValue ? undefined : value });
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filters">
      <FilterOption
        label="In stock only"
        active={!!filters.inStockOnly}
        onToggle={() => toggle('inStockOnly', true, true)}
      />
      <FilterOption
        label="Rating 4+"
        active={filters.minRating === 4}
        onToggle={() => toggle('minRating', 4, 4)}
      />
      <FilterOption
        label="Under ₹100"
        active={filters.maxPrice === 100}
        onToggle={() => toggle('maxPrice', 100, 100)}
      />
      <FilterOption
        label="10%+ discount"
        active={filters.minDiscount === 10}
        onToggle={() => toggle('minDiscount', 10, 10)}
      />
      <View style={{ marginTop: spacing.lg }}>
        <Button title="Apply Filters" onPress={onApply} fullWidth />
      </View>
    </BottomSheet>
  );
}

function FilterOption({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  const { colors, spacing, typography, radius } = useTheme();
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.option,
        {
          backgroundColor: active ? colors.primaryLight : colors.surfaceSecondary,
          borderRadius: radius.sm,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <Text style={[typography.body, { color: active ? colors.primary : colors.text }]}>{label}</Text>
      {active && <Text style={{ color: colors.primary }}>✓</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
