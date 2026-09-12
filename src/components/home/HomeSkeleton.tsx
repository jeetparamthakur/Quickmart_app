import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTheme } from '@/context/ThemeContext';

export function HomeSkeleton() {
  const { spacing } = useTheme();

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
      <Skeleton height={180} borderRadius={16} />
      <View style={[styles.dots, { marginTop: 12, marginBottom: 20 }]}>
        <Skeleton width={18} height={6} borderRadius={3} />
        <Skeleton width={6} height={6} borderRadius={3} />
        <Skeleton width={6} height={6} borderRadius={3} />
      </View>
      <Skeleton width={160} height={18} style={{ marginBottom: 14 }} />
      <View style={styles.cats}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={styles.cat}>
            <Skeleton height={72} borderRadius={16} />
            <Skeleton width="70%" height={10} style={{ marginTop: 8, alignSelf: 'center' }} />
          </View>
        ))}
      </View>
      <Skeleton width={140} height={18} style={{ marginTop: 8, marginBottom: 14 }} />
      <View style={styles.rail}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ width: 148, marginRight: 12 }}>
            <Skeleton height={148} borderRadius={16} />
            <Skeleton width="50%" height={10} style={{ marginTop: 8 }} />
            <Skeleton width="90%" height={14} style={{ marginTop: 6 }} />
            <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  cats: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  cat: { width: '25%', paddingRight: 8, marginBottom: 14 },
  rail: { flexDirection: 'row' },
});
