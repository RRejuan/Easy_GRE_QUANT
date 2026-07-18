import { getActiveProfileId } from "./profiles";

/** While signed in with a Firebase account, progress is keyed by the account
 * rather than the active guest profile, so cloud-synced data never mixes with
 * any guest profile's data. Null means guest mode (profile-keyed, as before). */
let cloudNamespace: string | null = null;

export function setCloudNamespace(namespace: string | null): void {
  cloudNamespace = namespace;
}

export function getStorageNamespace(): string {
  return cloudNamespace ?? getActiveProfileId();
}
