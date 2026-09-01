export const featureFlags = {
  ads_enabled: false,
  dark_mode_enabled: false,
  i18n_enabled: false,
  voice_search_enabled: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
