export interface Profile {
  id: string;
  name: string;
}

const PROFILES_KEY = "gre-quant:profiles";
const ACTIVE_PROFILE_KEY = "gre-quant:active-profile";

/** The multi-profile switcher UI is gone, but progress keys are still scoped
 * by a profile id: every guest browser gets one auto-created local profile,
 * and data written under it survives app updates (and gets adopted into a
 * Firebase account on first sign-in). */
function loadProfiles(): Profile[] {
  const raw = localStorage.getItem(PROFILES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Profile[];
  } catch {
    return [];
  }
}

function ensureDefaultProfile(): Profile[] {
  let profiles = loadProfiles();
  if (profiles.length === 0) {
    const guest: Profile = { id: crypto.randomUUID(), name: "Guest" };
    profiles = [guest];
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    localStorage.setItem(ACTIVE_PROFILE_KEY, guest.id);
  }
  return profiles;
}

export function getActiveProfileId(): string {
  const profiles = ensureDefaultProfile();
  const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (activeId && profiles.some((p) => p.id === activeId)) return activeId;
  const fallback = profiles[0].id;
  localStorage.setItem(ACTIVE_PROFILE_KEY, fallback);
  return fallback;
}
