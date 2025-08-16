import React from "react"
import { useGlobalContext } from "../../context/GlobalContext"
import { TimesheetData } from "../../models/Timesheet"
import DexieUtils from "../../utils/dexie-utils"
import { v4 as uuidv4 } from "uuid"

export const TimesheetService = () => {
  const {
    timesheetDate,
    timesheets,
    setTimesheets,
    runningTimesheet,
    setRunningTimesheet,
  } = useGlobalContext()

  const db = DexieUtils<TimesheetData>({
    tableName: "timesheet",
  })

  const updateTimesheet = async (ts: TimesheetData) => {
    await db.update(ts)

    setTimesheets(await getTimesheetsOfTheDay())
  }
  const getTimesheetsOfTheDay = async () => {
     console.log(timesheetDate)
    const selectedTimesheetDate = timesheetDate.setHours(0, 0, 0, 0)
    // const currentDate = new Date().setHours(0, 0, 0, 0)
    const timesheetsOfToday = (await db.getAll())//(await db.searchByField("timesheetDate", new Date(selectedTimesheetDate)))     
      .filter(
        (f) => f.timesheetDate.setHours(0, 0, 0, 0) === selectedTimesheetDate
      )
      .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())
    return timesheetsOfToday
  }

  const getTimesheetsRangeofDate = async (from: Date, to: Date) => {
    const fromDate = new Date(from).setHours(0, 0, 0, 0);
    const toDate = new Date(to).setHours(23, 59, 59, 999); // End of 'to' date
  
    // Get all timesheets and filter by date range
    const timesheetsInRange = (await db.getAll()).filter((f) => {
      const tsDate = new Date(f.timesheetDate).getTime();
      return tsDate >= fromDate && tsDate <= toDate;
    });
  
    // Optional: sort by createdDate
    timesheetsInRange.sort((a, b) => a.createdDate.getTime() - b.createdDate.getTime());
  
    return timesheetsInRange;
  };

  
  const getTimesheetsToUpload = async (from: Date, to: Date, selectedDays: string[], includecommentsonupload: boolean) => {
    const fromDate = new Date(from).setHours(0, 0, 0, 0)
    const toDate = new Date(to).setHours(23, 59, 59, 999) // End of the 'to' date

    // Get all timesheets within the date range and map data to add taskCode under client object
    const timesheetsInRange = (await db.getAll()).filter((f) => {
      const timesheetDate = new Date(f.timesheetDate).getTime()
      return timesheetDate >= fromDate && timesheetDate <= toDate
    }).map((ts) => { return { ...ts, client: { ...ts.client, taskCode: ts.client?.taskCode ?? ts.client?.value } } })

    console.log(selectedDays, "selectedDays")
    // Filter timesheets based on selectedDays 
    const filteredTimesheets = timesheetsInRange.filter((ts) => {
      const dayOfWeek = new Date(ts.timesheetDate).toLocaleString("en-US", {
        weekday: "long",
      }).toLowerCase()
      console.log(dayOfWeek, "dayOfWeek")
      return (selectedDays.map(s => s.toLocaleLowerCase())).includes(dayOfWeek)
    })

    const dayMapping = [
      "sunHours",
      "monHours",
      "tueHours",
      "wedHours",
      "thuHours",
      "friHours",
      "satHours",
    ]

    const toUpload = filteredTimesheets.reduce((acc: any[], ts: any) => {
      if (!ts.client) return acc

      const dayIndex = new Date(ts.timesheetDate).getDay() // 0: Sunday, 6: Saturday
      const hours = convertBillingHours(ts.duration ?? 0) // Use conversion function       
      console.log(ts.client)

      const desc = ts.taskDescription?.trim() || "";
      const comments = ts.comments?.trim() || "";
      const finalDescription = includecommentsonupload
        ? [desc, comments].filter(Boolean).join(' - ')
        : desc;

      let entry = acc.find(
        (item) =>
          item.projectCode === ts.client!.projectCode &&
          item.taskCode === ts.client!.taskCode &&
          item.client === ts.client!.client &&
          (item.workLoc?.id ?? "") === (ts.workLocation?.id ?? "") &&
          item.taskDescription?.trim() === finalDescription
      )

      if (!entry) {
        entry = {
          id: uuidv4(),
          client: ts.client.client,
          projectCode: ts.client.projectCode,
          taskCode: ts.client.taskCode,
          taskDescription: finalDescription,
          sunHours: 0,
          monHours: 0,
          tueHours: 0,
          wedHours: 0,
          thuHours: 0,
          friHours: 0,
          satHours: 0,
          workLoc: ts.workLocation,
        }
        acc.push(entry)
      }

      entry[dayMapping[dayIndex]] += hours

      return acc
    }, [])

    // do not include rows with 0 hours in all days
    const allDays = ["sunHours", "monHours", "tueHours", "wedHours", "thuHours", "friHours", "satHours"]
    const filteredEntries = toUpload.filter((entry) => {
      return allDays.some((day) => entry[day] > 0)
    })

    return filteredEntries
  }

  const setRunningToFalse = async (id: string) => {
    const timesheetsOfToday = await getTimesheetsOfTheDay()
    setTimesheets(timesheetsOfToday)

    timesheets.forEach(async (ts) => {
      if (ts.running && ts.id !== id) {
        ts.running = false
        // ts.pausedTime = new Date()
        await db.update(ts)
      }
    })

    // setTimesheets(timesheets)

    const timesheetsOfTodayRefresh = await getTimesheetsOfTheDay()
    setTimesheets(timesheetsOfTodayRefresh)
  }

  const getPrevRunningTimer = async (
    id: string
  ): Promise<TimesheetData | null> => {
    const timesheetsOfToday = await getTimesheetsOfTheDay()
    setTimesheets(timesheetsOfToday)

    let result = null
    timesheets.forEach(async (ts) => {
      if (ts.running && ts.id !== id) {
        result = ts
        return
      }
    })

    return result
  }

  const formatDuration = (duration: number): string => {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = Math.floor((duration % 60) / 1)

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // utilitites
  function convertBillingHours(duration: number) {
    try {
      const totalHours = Math.floor(duration / 3600) // Total hours from the duration
      const totalSeconds = duration % 3600 // Remaining seconds after extracting hours

      let remainderInMinutes = 0

      // 1 min - 6 mins and 59 secs
      if (totalSeconds >= 60 && totalSeconds <= 419) {
        remainderInMinutes = 0.1
      }
      // 7 mins - 12 mins and 59 secs
      else if (totalSeconds >= 420 && totalSeconds <= 779) {
        remainderInMinutes = 0.2
      }
      // 13 mins - 18 mins and 59 secs
      else if (totalSeconds >= 780 && totalSeconds <= 1139) {
        remainderInMinutes = 0.3
      }
      // 19 mins - 24 mins and 59 secs
      else if (totalSeconds >= 1140 && totalSeconds <= 1499) {
        remainderInMinutes = 0.4
      }
      // 25 mins - 30 mins and 59 secs
      else if (totalSeconds >= 1500 && totalSeconds <= 1859) {
        remainderInMinutes = 0.5
      }
      // 31 mins - 36 mins and 59 secs
      else if (totalSeconds >= 1860 && totalSeconds <= 2219) {
        remainderInMinutes = 0.6
      }
      // 37 mins - 42 mins and 59 secs
      else if (totalSeconds >= 2220 && totalSeconds <= 2579) {
        remainderInMinutes = 0.7
      }
      // 43 mins - 48 mins and 59 secs
      else if (totalSeconds >= 2580 && totalSeconds <= 2939) {
        remainderInMinutes = 0.8
      }
      // 49 mins - 54 mins and 59 secs
      else if (totalSeconds >= 2940 && totalSeconds <= 3299) {
        remainderInMinutes = 0.9
      }
      // 55 mins - 59 mins and 59 secs
      else if (totalSeconds >= 3300 && totalSeconds <= 3599) {
        remainderInMinutes = 1
      }

      return totalHours + remainderInMinutes
    } catch (e) {
      console.log("Error in convertBillingHours", e)
      return 0
    }
  }

  const convertToMinutes = (numericPart: number): string => {
    // Convert minutes (potentially decimal) to total seconds
    const totalSeconds = numericPart * 60;
    const hours = Math.floor(totalSeconds / 3600); // Calculate hours from total seconds
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60); // Round seconds

    // Ensure hours, minutes, and seconds don't exceed their limits after rounding
    const finalHours = hours % 24;
    const finalMinutes = minutes % 60;
    const finalSeconds = seconds % 60;

    return `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}:${String(finalSeconds).padStart(2, '0')}`;
  }

  // Method to parse a value with H (hour) or M (minute) suffix into HH:mm:ss format
  const parseTimeWithSuffix = (value: string): string => {
    const lowerValue = value.toLowerCase();
    let numericPart = parseFloat(value);

    if (lowerValue.endsWith('h')) {
      // Convert hours (potentially decimal) to total seconds
      const totalSeconds = numericPart * 3600;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.round(totalSeconds % 60); // Round seconds

      // Ensure hours, minutes, and seconds don't exceed their limits after rounding
      const finalHours = hours % 24; // Cap hours at 23 if input was e.g. 25h
      const finalMinutes = minutes % 60;
      const finalSeconds = seconds % 60;

      return `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}:${String(finalSeconds).padStart(2, '0')}`;
    } else if (lowerValue.endsWith('m')) {
      return convertToMinutes(numericPart);
    } else if (value.split(":").length === 1 && !lowerValue.endsWith('h') && !lowerValue.endsWith('m')) {
      return convertToMinutes(numericPart);
    }
    // This case should ideally not be reached if numberOrSuffixRegex is used correctly
    // before calling parseTimeWithSuffix with an explicit suffix.
    // However, as a fallback, return the original value or throw an error.
    return value;
  };

  const isValidTimeFormat = (value: string) => {
    // New regex: matches a number (integer or decimal) optionally followed by 'H', 'h', 'M', or 'm'.
    // This regex is used to determine if the input is *just* a number or a number with a known suffix.
    const numberOrSuffixRegex = /^\d+(\.\d+)?([HhMm])?$/;

    // This regex remains for a strict HH:mm:ss format.
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/;

    // Step 1: Check if it's a number (with or without a known suffix)
    if (numberOrSuffixRegex.test(value)) {
      // If it's a number, we need to decide if it has a suffix or if we default to minutes.
      const hasSuffix = /[HMhm]$/.test(value);

      let parsedForValidation;
      if (hasSuffix) {
        // If it has a suffix (like "1.5h", "30m"), parse it.
        parsedForValidation = parseTimeWithSuffix(value);
      } else {
        // If it's a plain number (like "5", "1.5"), default it to minutes.
        // We'll effectively add 'm' to it for parsing.
        parsedForValidation = parseTimeWithSuffix(value + 'm');
      }

      // After parsing (either with actual suffix or defaulted 'm'),
      // check if the result is in a valid HH:mm:ss format.
      // This allows us to ensure that even a simple number like '90' (which becomes 90m)
      // converts to a valid time like '01:30:00'.
      return timeRegex.test(parsedForValidation);

    }

    // Step 2: If it's not a number at all, check if it's a direct HH:mm:ss string.
    // This handles cases like "10:30:00" directly.
    return timeRegex.test(value);
  };

  const timeToSeconds = (time: string) => {
    const [hh, mm, ss] = time.split(":").map(Number)
    return hh * 3600 + mm * 60 + ss
  }

  const secondsToTime = (seconds: number) => {
    const hh = String(Math.floor(seconds / 3600)).padStart(2, "0")
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")
    const ss = String(seconds % 60).padStart(2, "0")
    return `${hh}:${mm}:${ss}`
  }

  const parseShorthandTime = (input: string): string => {
    // Allow inputs like "1h", "2m", etc.
    const shorthandRegex = /^(\d+)([hHmM])$/
    const match = input.match(shorthandRegex)

    if (match) {
      const number = parseInt(match[1])
      const unit = match[2].toLowerCase()

      let totalSeconds = 0
      if (unit === "h") {
        totalSeconds = number * 3600 // Convert hours to seconds
      } else if (unit === "m") {
        totalSeconds = number * 60 // Convert minutes to seconds
      }
      return secondsToTime(totalSeconds)
    }

    return input // If not shorthand, return the original input
  }

  const processPrevRunningTimesheet = async () => {
    const timesheetsInDB = (await db.getAll())
    const prevRunningTS = timesheetsInDB.find((x) => x.running)
    let prevRunningDuration = 0
    if (prevRunningTS) {
      prevRunningDuration = prevRunningTS.duration! // prev running duration when click on other timer
    }

    // calculate duration of prev running timesheet, based on fuse-startTime before it resets
    const currentTime = new Date()
    const prevStartTime = localStorage.getItem("fuse-startTime")
      ? new Date(JSON.parse(localStorage.getItem("fuse-startTime")!))
      : null
    if (currentTime instanceof Date && prevStartTime instanceof Date) {
      const elapsedTime = currentTime.getTime() - prevStartTime.getTime()

      prevRunningDuration =
        prevRunningDuration! + Math.floor(elapsedTime / 1000)
    }

    // update prev running timesheet if any - set running false and refresh state
    if (prevRunningTS) {
      await updateTimesheet({
        ...prevRunningTS,
        duration: prevRunningDuration,
        running: false,
      })
      // setTimesheets(await getTimesheetsOfTheDay())
    }
  }

  const stopAllRunningTasks = async () => {
    const runningTasks = (await db.getAll()).filter((x) => x.running)

    runningTasks.forEach(async (rt) => {
      rt.running = false
      await db.update(rt)
    })

    // setTimesheets(await getTimesheetsOfTheDay())
  }

  return {
    getTimesheetsOfTheDay: getTimesheetsOfTheDay,
    getTimesheetsRangeofDate,
    convertBillingHours,
    setRunningToFalse,
    getPrevRunningTimer,
    formatDuration,
    updateTimesheet,
    getTimesheetsToUpload,
    isValidTimeFormat,
    timeToSeconds,
    secondsToTime,
    parseShorthandTime,
    processPrevRunningTimesheet,
    stopAllRunningTasks,
    parseTimeWithSuffix
  }
}
