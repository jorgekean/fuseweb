import { useState, useEffect } from "react";
import DexieUtils from "../../utils/dexie-utils";
import { MiscTimeData } from "../../models/MiscTime";

interface EditableStartTimeProps {
    startTime: Date | undefined;
}

export default function EditableStartTime({ startTime }: EditableStartTimeProps) {
    const miscDB = DexieUtils<MiscTimeData>({
        tableName: "miscTime",
    });

    const formatTime = (date: Date | undefined) =>
        date
            ? date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
            : '00:00 AM';

    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(formatTime(startTime));
    const [parsedDate, setParsedDate] = useState<Date | undefined>(startTime);

    // This useEffect will run whenever the startTime prop changes
    useEffect(() => {
        setValue(formatTime(startTime));
        setParsedDate(startTime);
    }, [startTime]); // зависимость от startTime

    const handleBlur = async () => {
        if (!startTime) return;

        const updatedDate = parseTimeToDate(startTime, value);
        setParsedDate(updatedDate);
        setValue(formatTime(updatedDate)); // Normalize input
        setIsEditing(false);

        // update miscDB with the new date
        const miscTimers = await miscDB.getAll()
        const miscTimer = miscTimers.find(
            (f) => f.timesheetDate.setHours(0, 0, 0, 0) ===
                startTime.setHours(0, 0, 0, 0))
        if (!miscTimer) return

        const updatedMiscTimer: MiscTimeData = {
            ...miscTimer,
            startTime: updatedDate,
        };
        await miscDB.update(updatedMiscTimer);

        console.log("Updated full Date:", updatedDate);
    };

    const parseTimeToDate = (originalDate: Date, timeStr: string): Date => {
        const [time, modifierRaw] = timeStr.trim().split(/ (AM|PM)/i).filter(Boolean);
        const modifier = modifierRaw.toUpperCase();
        const [hoursStr, minutesStr] = time.split(':');

        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const newDate = new Date(originalDate);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);

        return newDate;
    };

    return (
        <div className="text-secondary2 dark:text-secondary3 font-bold">
            Start Time:
            {isEditing ? (
                <input
                    type="text"
                    className="ml-2 text-secondary2 dark:text-secondary2 border border-gray-300 rounded px-1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={handleBlur}
                    autoFocus
                />
            ) : (
                <span
                    className="ml-2 text-secondary2 dark:text-secondary2 cursor-pointer hover:underline"
                    onClick={() => setIsEditing(true)}
                >
                    {value}
                </span>
            )}
        </div>
    );
}