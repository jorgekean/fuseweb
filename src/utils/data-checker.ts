

/**
 * Checks if it's a new calendar day in a specific timezone.
 *
 * @param {string} timeZone - The user's IANA timezone name (e.g., 'America/New_York', 'Asia/Manila').
 * @returns {boolean} - True if it's a new day or the first visit.
 */
export const isBrandNewDay = (timeZone: string): boolean => {
    // 1. Get the last prompt date string (stored in UTC) from localStorage.
    const lastPromptDateString = localStorage.getItem("prompt-brand-new-day");

    // If it doesn't exist, it's the user's first time, so it's a "new day".
    if (!lastPromptDateString) {
        return true;
    }

    // 2. Create a formatter to produce a date string (like "2025-07-11")
    //    in the user's selected timezone.
    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    // 3. Format both the stored date and the current date into that timezone.
    const lastDate = dateFormatter.format(new Date(lastPromptDateString));
    const currentDate = dateFormatter.format(new Date());

    // 4. Compare the date strings. If they are different, it's a new day.
    return lastDate !== currentDate;
}