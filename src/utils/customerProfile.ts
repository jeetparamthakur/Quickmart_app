export const PLACEHOLDER_PROFILE_NAME = 'User';

export function isDefaultProfileName(name?: string | null): boolean {
  const trimmed = name?.trim();
  return !trimmed || trimmed === PLACEHOLDER_PROFILE_NAME;
}
