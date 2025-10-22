/**
 * Get today's date as YYYY-MM-DD string in local timezone (not UTC)
 * This ensures the date matches the user's local calendar date
 */
export const getLocalDateISO = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date string (YYYY-MM-DD)
 */
export const getTodayDateISO = (): string => {
  return getLocalDateISO();
};
