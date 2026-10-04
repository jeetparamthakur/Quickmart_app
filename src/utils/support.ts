import { Alert, Linking } from 'react-native';
import { SUPPORT_EMAIL, SUPPORT_PHONE_DIGITS } from '@/constants/support';

const DEFAULT_WHATSAPP_MESSAGE = 'Hi, I need help with my QuickMart order.';
const DEFAULT_EMAIL_SUBJECT = 'QuickMart customer support';

async function openUrl(url: string, failureMessage: string) {
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert('Unable to open', failureMessage);
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert('Unable to open', failureMessage);
  }
}

export function openSupportCall(phoneDigits = SUPPORT_PHONE_DIGITS) {
  const tel = phoneDigits.replace(/\D/g, '');
  void openUrl(`tel:+${tel}`, 'Phone calls are not available on this device.');
}

export function openSupportWhatsApp(
  phoneDigits = SUPPORT_PHONE_DIGITS,
  message = DEFAULT_WHATSAPP_MESSAGE,
) {
  const wa = phoneDigits.replace(/\D/g, '');
  void openUrl(
    `https://wa.me/${wa}?text=${encodeURIComponent(message)}`,
    'WhatsApp is not installed or could not be opened.',
  );
}

export function openSupportEmail(
  email = SUPPORT_EMAIL,
  subject = DEFAULT_EMAIL_SUBJECT,
  body = '',
) {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  const url = query ? `mailto:${email}?${query}` : `mailto:${email}`;
  void openUrl(url, 'No email app is configured on this device.');
}
