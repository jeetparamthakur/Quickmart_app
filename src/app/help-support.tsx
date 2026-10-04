import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader, Button } from '@/components/ui';
import { FaqItem } from '@/components/support/FaqItem';
import { useTheme } from '@/context/ThemeContext';
import { SUPPORT_FAQ_ITEMS } from '@/constants/supportFaq';
import { formatSupportPhoneDisplay } from '@/constants/support';
import { openSupportCall, openSupportEmail, openSupportWhatsApp } from '@/utils/support';
import { t } from '@/i18n';

export default function HelpSupportScreen() {
  const { colors, spacing, typography } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const phoneDisplay = formatSupportPhoneDisplay();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={t('supportTitle')} showBack />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }}>
        <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 22 }]}>
          {t('supportSubtitle')}
        </Text>

        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, fontWeight: '700', marginBottom: spacing.sm, marginLeft: 4 },
          ]}
        >
          {t('faqSection')}
        </Text>
        {SUPPORT_FAQ_ITEMS.map((item) => (
          <FaqItem
            key={item.id}
            question={t(item.questionKey)}
            answer={t(item.answerKey)}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
          />
        ))}

        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm, marginLeft: 4 },
          ]}
        >
          {t('contactSection')}
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.md, marginLeft: 4 }]}>
          {t('supportHours')}
        </Text>

        <View style={{ gap: spacing.sm }}>
          <Button
            title={`${t('callSupport')} · ${phoneDisplay}`}
            onPress={() => openSupportCall()}
            fullWidth
            leftIcon="call-outline"
          />
          <Button
            title={t('whatsappSupport')}
            variant="secondary"
            onPress={() => openSupportWhatsApp()}
            fullWidth
            leftIcon="logo-whatsapp"
          />
          <Button
            title={t('emailSupport')}
            variant="secondary"
            onPress={() => openSupportEmail()}
            fullWidth
            leftIcon="mail-outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
