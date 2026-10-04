import * as ExpoHaptics from 'expo-haptics';
import { featureFlags } from '@/constants/featureFlags';

export const ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType;

function enabled() {
  return featureFlags.haptics_enabled;
}

export async function selectionAsync(): Promise<void> {
  if (!enabled()) return;
  await ExpoHaptics.selectionAsync();
}

export async function impactAsync(style: ExpoHaptics.ImpactFeedbackStyle): Promise<void> {
  if (!enabled()) return;
  await ExpoHaptics.impactAsync(style);
}

export async function notificationAsync(type: ExpoHaptics.NotificationFeedbackType): Promise<void> {
  if (!enabled()) return;
  await ExpoHaptics.notificationAsync(type);
}
