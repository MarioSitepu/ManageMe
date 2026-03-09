/**
 * Date utility helpers for consistent timezone handling
 */

/**
 * Returns a Date object set to local midnight in Asia/Jakarta
 * This is useful for database queries that filter by date (YYYY-MM-DD)
 */
export const getLocalToday = () => {
    return new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }));
};

/**
 * Formats a date to YYYY-MM-DD in Asia/Jakarta
 */
export const formatLocalDate = (date: Date = new Date()) => {
    return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
};

/**
 * Gets the current day name in Asia/Jakarta (e.g., "Monday")
 */
export const getLocalDayName = (date: Date = new Date()) => {
    return date.toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta', weekday: 'long' });
};
