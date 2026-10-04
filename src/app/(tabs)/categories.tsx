import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ScreenHeader, Skeleton } from '@/components/ui';
import { homeService } from '@/services/api/home.service';
import { Category } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';
import { useTabScreenInsets } from '@/hooks/useTabScreenInsets';
import { t } from '@/i18n';

export default function CategoriesScreen() {
  const { colors, spacing } = useTheme();
  const { contentPaddingBottom } = useTabScreenInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    homeService.getCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={t('categories')} gradient />
      {loading ? (
        <View style={{ padding: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} width={100} height={100} borderRadius={12} />
          ))}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: contentPaddingBottom, paddingTop: spacing.sm }}
        >
          <CategoryGrid categories={categories} horizontal={false} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
