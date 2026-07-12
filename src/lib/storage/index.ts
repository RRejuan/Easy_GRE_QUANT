import { LocalStorageAdapter } from "./LocalStorageAdapter";

export const storageAdapter = new LocalStorageAdapter();
export * from "./StorageAdapter";
export * from "./profiles";
export { exportProgressJSON, importProgressJSON, resetProgress } from "./LocalStorageAdapter";
