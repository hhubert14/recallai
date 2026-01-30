/**
 * Get date string in YYYY-MM-DD format.
 * If timezone is provided, returns the date in that timezone.
 * Otherwise, returns the date in local (server) timezone.
 */
export function getLocalDateString(date: Date = new Date(), timezone?: string): string {
  if (!timezone) {
    // Original behavior - use local (server) timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  try {
    // Use Intl.DateTimeFormat for timezone-aware date formatting
    // "en-CA" locale formats dates as YYYY-MM-DD
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    // Invalid timezone - fall back to original behavior
    return getLocalDateString(date);
  }
}
