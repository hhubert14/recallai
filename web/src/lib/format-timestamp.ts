export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function parseTimestamp(timestamp: string): number | null {
  // Match MM:SS or H:MM:SS format
  const parts = timestamp.split(":");

  if (parts.length === 2) {
    // MM:SS format
    const mins = parseInt(parts[0], 10);
    const secs = parseInt(parts[1], 10);
    if (isNaN(mins) || isNaN(secs)) return null;
    return mins * 60 + secs;
  }

  if (parts.length === 3) {
    // H:MM:SS format
    const hours = parseInt(parts[0], 10);
    const mins = parseInt(parts[1], 10);
    const secs = parseInt(parts[2], 10);
    if (isNaN(hours) || isNaN(mins) || isNaN(secs)) return null;
    return hours * 3600 + mins * 60 + secs;
  }

  return null;
}
