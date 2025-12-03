/**
 * Storage keys for extension settings
 */
export const STORAGE_KEYS = {
  PROCESSING_MODE: 'processingMode',
} as const;

/**
 * Processing mode types
 */
export type ProcessingMode = 'automatic' | 'manual';

/**
 * Storage interface for extension settings
 */
export interface ExtensionSettings {
  processingMode: ProcessingMode;
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: ExtensionSettings = {
  processingMode: 'automatic',
};

/**
 * Get processing mode from storage
 */
export async function getProcessingMode(): Promise<ProcessingMode> {
  const result = await browser.storage.local.get(STORAGE_KEYS.PROCESSING_MODE);
  return result[STORAGE_KEYS.PROCESSING_MODE] || DEFAULT_SETTINGS.processingMode;
}

/**
 * Set processing mode in storage
 */
export async function setProcessingMode(mode: ProcessingMode): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEYS.PROCESSING_MODE]: mode });
}

/**
 * Get all settings from storage
 */
export async function getSettings(): Promise<ExtensionSettings> {
  const result = await browser.storage.local.get(Object.values(STORAGE_KEYS));
  return {
    processingMode: result[STORAGE_KEYS.PROCESSING_MODE] || DEFAULT_SETTINGS.processingMode,
  };
}
