/**
 * Chrome Extension Configuration
 *
 * Extension IDs:
 * - Production: From Chrome Web Store
 * - Development: From locally loaded unpacked extension
 */

const EXTENSION_IDS = {
  production: "dciecdpjkhhagindacahojeiaeecblaa", // Chrome Web Store
  development: "dkhdblpppokkcgpecjjncchhdlinfjcl", // Local unpacked
} as const;

/**
 * Get the correct extension ID based on environment
 */
export function getExtensionId(): string {
  // Check if we're in development (localhost)
  const isDevelopment =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  return isDevelopment ? EXTENSION_IDS.development : EXTENSION_IDS.production;
}

// Export individual IDs for reference
export const PRODUCTION_EXTENSION_ID = EXTENSION_IDS.production;
export const DEVELOPMENT_EXTENSION_ID = EXTENSION_IDS.development;
