import { isBrandNewDay } from './../src/utils/data-checker.ts';

// Mock the global localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('isBrandNewDay', () => {
    const timeZone = 'America/Detroit'; // Use a consistent timezone for tests

    beforeEach(() => {
        // Reset mocks and timers before each test
        localStorage.clear();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('should return true on the first visit when localStorage is empty', () => {
        // No need to set localStorage, it's empty by default
        expect(isBrandNewDay(timeZone)).toBe(true);
    });

    test('should return true for PH user with Detroit timezone setting', () => {
        // 1. The timezone setting configured inside the application.
        const appTimezoneSetting = 'America/Detroit';

        // 2. The last prompt time, stored in UTC.
        // In Detroit Time (EDT, UTC-4), this was 12:00 PM on July 10, 2025.
        const lastPromptUTC = '2025-07-10T16:00:00.000Z';
        localStorage.setItem('prompt-brand-new-day', lastPromptUTC);

        // 3. Set the "current" system time to match the user's actual time in the Philippines.
        // 10:00 PM on July 11 in the Philippines (PHT, UTC+8) is 2:00 PM on July 11 in UTC.
        jest.setSystemTime(new Date('2025-07-11T14:00:00.000Z'));

        // 4. The function will compare the dates using the 'America/Detroit' setting.
        // It sees the last prompt as '2025-07-10' and the current time as '2025-07-11'.
        // Since the dates are different, the result is true.
        expect(isBrandNewDay(appTimezoneSetting)).toBe(true);
    });

    test('should return false if the stored date is the same day in the given timezone', () => {
        // Simulate "now" being 10:00 AM in New York
        jest.setSystemTime(new Date('2025-07-10T14:00:00Z')); // 10 AM EDT is 14:00 UTC

        // Simulate the last prompt was 2 hours ago on the same day
        const lastPromptUTC = '2025-07-10T12:00:00Z'; // 8 AM EDT
        localStorage.setItem('prompt-brand-new-day', lastPromptUTC);

        expect(isBrandNewDay(timeZone)).toBe(false);
    });

    test('should return true if the stored date is from the previous day', () => {
        // Simulate "now" being 10:00 AM on July 11th
        jest.setSystemTime(new Date('2025-07-11T14:00:00Z')); // 10 AM EDT

        // Simulate the last prompt was yesterday
        const lastPromptUTC = '2025-07-10T20:00:00Z'; // 4 PM EDT yesterday
        localStorage.setItem('prompt-brand-new-day', lastPromptUTC);

        expect(isBrandNewDay(timeZone)).toBe(true);
    });

    test('should correctly handle the changeover at midnight in the specified timezone', () => {
        // Simulate last prompt was just before midnight in New York
        const lastPromptUTC = '2025-07-10T03:59:00Z'; // 11:59 PM July 9th in UTC is 7:59 PM July 9th EDT
        // Let's use a clearer UTC time for this
        // 11:59 PM on July 10 in New York (EDT) is 03:59 UTC on July 11
        localStorage.setItem('prompt-brand-new-day', '2025-07-11T03:59:00Z');

        // Simulate "now" being just after midnight
        jest.setSystemTime(new Date('2025-07-11T04:01:00Z')); // 12:01 AM EDT on July 11th

        expect(isBrandNewDay(timeZone)).toBe(true);
    });

    test('should return false for a user in a different timezone where the date has not changed', () => {
        const userTimeZone = 'Asia/Tokyo'; // JST is UTC+9

        // Set the "current time" to be July 11, 8:00 AM in Tokyo
        jest.setSystemTime(new Date('2025-07-10T23:00:00Z'));

        // Set the last prompt to be July 10, 10:00 PM in Tokyo
        localStorage.setItem('prompt-brand-new-day', '2025-07-10T13:00:00Z');

        // In Tokyo, both timestamps are on the same calendar day (July 11th vs July 10th)
        // Whoops, let's fix the logic for the test case itself.
        // If "now" is July 11 @ 8AM JST, and "last prompt" was July 11 @ 7AM JST, it's the same day.
        jest.setSystemTime(new Date('2025-07-10T23:00:00Z')); // This is 8:00 JST on July 11
        localStorage.setItem('prompt-brand-new-day', '2025-07-10T22:00:00Z'); // This is 7:00 JST on July 11

        expect(isBrandNewDay(userTimeZone)).toBe(false);
    });
});