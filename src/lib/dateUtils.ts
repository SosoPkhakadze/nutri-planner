// src/lib/dateUtils.ts

/**
 * Gets the start of the week (Sunday) for a given date.
 * @param date The date to find the start of the week for.
 * @returns A new Date object set to the beginning of Sunday of that week.
 */
export function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // Sunday - 0, Monday - 1, etc.
    const diff = d.getDate() - day; // Adjust to Sunday
    return new Date(d.setDate(diff));
  }
  
  /**
   * Generates an array of 7 Date objects for a week, starting from a given date.
   * @param startDate The starting date of the week (should be a Sunday).
   * @returns An array of 7 Date objects, from Sunday to Saturday.
   */
  export function getWeekDays(startDate: Date): Date[] {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(startDate);
      newDate.setDate(startDate.getDate() + i);
      dates.push(newDate);
    }
    return dates;
  }