export interface Profile {
  id: string;
  name: string;
}

const PROFILES_KEY = "gre-quant:profiles";
const ACTIVE_PROFILE_KEY = "gre-quant:active-profile";

function loadProfiles(): Profile[] {
  const raw = localStorage.getItem(PROFILES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Profile[];
  } catch {
    return [];
  }
}

function saveProfiles(profiles: Profile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function ensureDefaultProfile(): Profile[] {
  let profiles = loadProfiles();
  if (profiles.length === 0) {
    const guest: Profile = { id: crypto.randomUUID(), name: "Guest" };
    profiles = [guest];
    saveProfiles(profiles);
    localStorage.setItem(ACTIVE_PROFILE_KEY, guest.id);
  }
  return profiles;
}

export function listProfiles(): Profile[] {
  return ensureDefaultProfile();
}

export function getActiveProfileId(): string {
  const profiles = ensureDefaultProfile();
  const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (activeId && profiles.some((p) => p.id === activeId)) return activeId;
  const fallback = profiles[0].id;
  localStorage.setItem(ACTIVE_PROFILE_KEY, fallback);
  return fallback;
}

export function setActiveProfileId(id: string): void {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

export function createProfile(name: string): Profile {
  const profiles = ensureDefaultProfile();
  const profile: Profile = { id: crypto.randomUUID(), name };
  saveProfiles([...profiles, profile]);
  setActiveProfileId(profile.id);
  return profile;
}

export function renameProfile(id: string, name: string): void {
  const profiles = ensureDefaultProfile().map((p) =>
    p.id === id ? { ...p, name } : p,
  );
  saveProfiles(profiles);
}

export function deleteProfile(id: string): void {
  const remaining = ensureDefaultProfile().filter((p) => p.id !== id);
  const finalProfiles =
    remaining.length > 0 ? remaining : [{ id: crypto.randomUUID(), name: "Guest" }];
  saveProfiles(finalProfiles);
  localStorage.removeItem(`gre-quant:mastery:${id}`);
  if (localStorage.getItem(ACTIVE_PROFILE_KEY) === id) {
    setActiveProfileId(finalProfiles[0].id);
  }
}
