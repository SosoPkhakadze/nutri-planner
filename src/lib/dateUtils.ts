// src/lib/dateUtils.ts
/**
 * Gets the start of the week (Sunday) for a given date, using UTC.
 * @param date The date to find the start of the week for.
 * @returns A new Date object set to the beginning of Sunday of that week in UTC.
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date.valueOf()); // Create a copy
  const day = d.getUTCDay(); // Sunday - 0, Monday - 1, etc. in UTC
  const diff = d.getUTCDate() - day; // Adjust to Sunday in UTC
  d.setUTCDate(diff);
  return d;
}

/**
 * Generates an array of 7 Date objects for a week, starting from a given date, using UTC.
 * @param startDate The starting date of the week (should be a Sunday in UTC).
 * @returns An array of 7 Date objects, from Sunday to Saturday.
 */
export function getWeekDays(startDate: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const newDate = new Date(startDate.valueOf());
    newDate.setUTCDate(startDate.getUTCDate() + i);
    dates.push(newDate);
  }
  return dates;
}