import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { photonSearchAddresses } from '@/services/geocoding';
import type { AddressResult } from '@/utils/address';
import { useTheme } from '@/context/ThemeContext';
import { PressableScale } from '@/components/ui';

type Props = {
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
  label?: string;
};

const DEBOUNCE_MS = 350;

export function AddressSearchInput({
  onSelect,
  placeholder = 'Search address in India...',
  label = 'Search address',
}: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const matches = await photonSearchAddresses(trimmed);
        setResults(matches);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  function handleSelect(result: AddressResult) {
    setQuery(result.addressLine);
    setResults([]);
    onSelect(result);
  }

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[typography.label, { color: colors.text, marginBottom: spacing.xs }]}>{label}</Text>
      ) : null}
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            borderRadius: radius.md,
          },
        ]}
        autoCorrect={false}
      />
      {loading && (
        <View style={[styles.loadingRow, { marginTop: spacing.sm }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
            Searching…
          </Text>
        </View>
      )}
      {results.length > 0 && (
        <View
          style={[
            styles.results,
            {
              marginTop: spacing.sm,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
            },
          ]}
        >
          {results.map((result, index) => (
            <PressableScale
              key={`${result.latitude}-${result.longitude}-${index}`}
              onPress={() => handleSelect(result)}
              haptic="selection"
              style={[
                styles.resultRow,
                index < results.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={[typography.bodySmall, { color: colors.text }]} numberOfLines={2}>
                {result.addressLine}
              </Text>
            </PressableScale>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  results: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  resultRow: { paddingHorizontal: 14, paddingVertical: 12 },
});
