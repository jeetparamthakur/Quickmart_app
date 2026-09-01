import { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { homeService } from '@/services/api/home.service';
import { Category } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

export default function CategoriesScreen() {
  const { colors, spacing, typography } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    homeService.getCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[typography.h2, { color: colors.text, padding: spacing.lg }]}>
        {t('categories')}
      </Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <CategoryGrid categories={categories} horizontal={false} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
