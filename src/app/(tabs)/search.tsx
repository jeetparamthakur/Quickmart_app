import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar, Skeleton, AdSlot, EmptyState } from '@/components/ui';
import { StoreCard } from '@/components/home/StoreCard';
import { FilterSheet } from '@/components/search/FilterSheet';
import { ProductResultList } from '@/components/search/ResultList';
import { productService, SearchFilters } from '@/services/api/product.service';
import { Product } from '@/types/product';
import { Store } from '@/types/store';
import { useDebounce } from '@/hooks/useDebounce';
import { useTheme } from '@/context/ThemeContext';
import { trendingSearches } from '@/services/mock/data';
import { t } from '@/i18n';

const RECENT_KEY = 'recent-searches';

export default function SearchScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'products' | 'stores'>('products');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ inStockOnly: false });
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((val) => {
      if (val) setRecent(JSON.parse(val));
    });
  }, []);

  useEffect(() => {
    productService.getSuggestions(debouncedQuery).then(setSuggestions);
  }, [debouncedQuery]);

  const doSearch = useCallback(async (q: string, f?: SearchFilters) => {
    if (!q.trim()) return;
    setLoading(true);
    const result = await productService.search(q, f ?? filters);
    setProducts(result.products);
    setStores(result.stores);
    setLoading(false);

    const updated = [q, ...recent.filter((r) => r !== q)].slice(0, 8);
    setRecent(updated);
    AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  }, [filters, recent]);

  useEffect(() => {
    if (debouncedQuery.trim()) doSearch(debouncedQuery);
  }, [debouncedQuery, doSearch]);

  const showResults = query.trim().length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={{ padding: spacing.lg }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('searchPlaceholder')}
          onSubmit={() => doSearch(query)}
        />
      </View>

      {!showResults ? (
        <ScrollView style={{ paddingHorizontal: spacing.lg }}>
          {recent.length > 0 && (
            <>
              <Text style={[typography.label, { color: colors.text, marginBottom: spacing.sm }]}>Recent Searches</Text>
              <View style={styles.chips}>
                {recent.map((r) => (
                  <TouchableOpacity key={r} onPress={() => setQuery(r)} style={[styles.chip, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.sm }]}>
                    <Text style={[typography.bodySmall, { color: colors.text }]}>🕐 {r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          <Text style={[typography.label, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }]}>Trending</Text>
          <View style={styles.chips}>
            {trendingSearches.map((s) => (
              <TouchableOpacity key={s} onPress={() => setQuery(s)} style={[styles.chip, { backgroundColor: colors.primaryLight, borderRadius: radius.sm }]}>
                <Text style={[typography.bodySmall, { color: colors.primary }]}>🔥 {s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {suggestions.length > 0 && query.length > 0 && (
            <>
              <Text style={[typography.label, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }]}>Suggestions</Text>
              {suggestions.map((s) => (
                <TouchableOpacity key={s} onPress={() => setQuery(s)} style={{ paddingVertical: spacing.sm }}>
                  <Text style={[typography.body, { color: colors.text }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={[styles.tabs, { paddingHorizontal: spacing.lg, marginBottom: spacing.md }]}>
            {(['products', 'stores'] as const).map((t_) => (
              <TouchableOpacity
                key={t_}
                onPress={() => setTab(t_)}
                style={[styles.tab, tab === t_ && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              >
                <Text style={[typography.label, { color: tab === t_ ? colors.primary : colors.textSecondary }]}>
                  {t_ === 'products' ? 'Products' : 'Stores'} ({t_ === 'products' ? products.length : stores.length})
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowFilters(true)} style={{ marginLeft: 'auto' }}>
              <Text style={[typography.label, { color: colors.primary }]}>Filters</Text>
            </TouchableOpacity>
          </View>

          <AdSlot placement="search_inline" />

          {loading ? (
            <View style={{ padding: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} width={150} height={200} borderRadius={12} />)}
            </View>
          ) : tab === 'products' ? (
            products.length === 0 ? (
              <EmptyState icon="🔍" title="No products found" subtitle="Try different keywords or adjust filters" />
            ) : (
              <ProductResultList products={products} />
            )
          ) : stores.length === 0 ? (
            <EmptyState icon="🏪" title="No stores found" subtitle="Try searching with a different term" />
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
              {stores.map((s) => <StoreCard key={s.id} store={s} />)}
            </ScrollView>
          )}
        </View>
      )}

      <FilterSheet
        visible={showFilters}
        filters={filters}
        onClose={() => setShowFilters(false)}
        onChange={setFilters}
        onApply={() => { setShowFilters(false); doSearch(query, filters); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8 },
  tabs: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  tab: { paddingBottom: 8 },
});
