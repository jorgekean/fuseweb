// hooks/useConvertToTimezone.ts
import { DateTime } from "luxon";

export function useConvertToTimezone(timezone: string) {
    /**
     * Converts a JS Date or ISO string to the selected timezone
     */
    const convert = (inputDate: Date | string): DateTime => {
        return DateTime.fromJSDate(new Date(inputDate))
            .setZone(timezone)
        // .toFormat("yyyy-LL-dd HH:mm:ss ZZZZ");
    };

    return { convert };
}
