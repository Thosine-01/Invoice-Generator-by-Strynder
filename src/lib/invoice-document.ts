import type { ProfileSnapshot } from "@/lib/types";

export function hasBusinessIdentity(profile: ProfileSnapshot): boolean {
  return !!(
    profile.business_name ||
    profile.owner_name ||
    profile.slogan ||
    profile.logo_url
  );
}

export function hasProfileContact(profile: ProfileSnapshot): boolean {
  return !!(profile.address || profile.phone || profile.email);
}

export function hasTextContent(value?: string | null): boolean {
  return !!value?.trim();
}
