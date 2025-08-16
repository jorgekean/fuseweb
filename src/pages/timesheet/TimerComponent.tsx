import { Play, Pause } from "react-feather";
import React, { useEffect, useState, useRef } from "react"; // Import useRef
import { useGlobalContext } from "../../context/GlobalContext";
import { TimesheetService } from "./TimesheetService";
import { TimesheetData } from "../../models/Timesheet";
import { sortBy, times } from "lodash";
import DexieUtils from "../../utils/dexie-utils";
import toast from "react-hot-toast";
import { FaClock, FaPencilAlt } from "react-icons/fa";
import AddTimeButton, { AddTimeButtonRef } from "./AddTimeButton";

interface TimerComponentProps {
  timesheet: TimesheetData;
  sortConfig?: any;
  updateData: (id: number | string, columnId: string, value: any) => void;
}

const TimerComponent: React.FC<TimerComponentProps> = ({ timesheet, updateData }) => {
  const [isEditing, setEditing] = useState(false);

  const [isToday, setIsToday] = useState(false);
  const [isRunning, setIsRunning] = useState(timesheet.running);
  const [duration, setDuration] = useState<number>(timesheet.duration || 0)
  const [durationStr, setDurationStr] = useState<string>("00:00:00")
  const [startTime, setStartTime] = useState<Date | null>(
    localStorage.getItem("fuse-startTime")
      ? new Date(JSON.parse(localStorage.getItem("fuse-startTime")!))
      : null
  )

  // --- START Minimal Changes for your request ---
  // Create a ref for the clock button to check if it's the target of a blur
  const clockButtonRef = useRef<AddTimeButtonRef>(null);
  // --- END Minimal Changes ---


  const db = DexieUtils<TimesheetData>({
    tableName: "timesheet",
  })

  const { timesheetDate, timesheets, setTimesheets, updateTimesheetItem } = useGlobalContext();
  const timesheetService = TimesheetService();

  useEffect(() => {

    if (timesheet.running) {
      const calculateDuration = async () => {
        const currentTime = new Date()
        if (currentTime instanceof Date && startTime instanceof Date) {
          const elapsedTime = currentTime.getTime() - startTime.getTime()
          setDuration(duration + Math.floor(elapsedTime / 1000))
        }
      }

      calculateDuration()
      const intervalId = setInterval(calculateDuration, 1000)
      return () => clearInterval(intervalId)
    }

  }, [timesheet.running])

  useEffect(() => {
    setIsToday(
      timesheetDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
    );

    setIsRunning(timesheet.running)
  }, [timesheets]);

  const toggleTimer = async () => {


    const prevRunningTS = (await db.getAll()).find(x => x.running && x.id !== timesheet.id);

    let prevRunningDuration = 0;
    if (prevRunningTS) {
      prevRunningDuration = prevRunningTS.duration!// prev running duration when click on other timer
    }

    // calculate duration of prev running timesheet, based on fuse-startTime before it resets     
    const currentTime = new Date()
    const prevStartTime = localStorage.getItem("fuse-startTime") ? new Date(JSON.parse(localStorage.getItem("fuse-startTime")!)) : null
    if (currentTime instanceof Date && prevStartTime instanceof Date) {
      const elapsedTime = currentTime.getTime() - prevStartTime.getTime()

      prevRunningDuration = prevRunningDuration! + Math.floor(elapsedTime / 1000)
    }

    // set local storage start time so that even moving on different pages the timer will not reset
    if (!isRunning) {
      localStorage.setItem("fuse-startTime", JSON.stringify(new Date()))
      localStorage.setItem("fuse-runningTimesheet", JSON.stringify(timesheet));
      setStartTime(new Date())
      timesheet.startTime = new Date()
    } else {
      localStorage.removeItem("fuse-startTime")
      localStorage.removeItem("fuse-runningTimesheet")
      setStartTime(null)
    }

    setIsRunning(!isRunning);

    // update prev running timesheet if any - set running false and refresh state    
    if (prevRunningTS) {
      await timesheetService.updateTimesheet({ ...prevRunningTS, duration: prevRunningDuration, running: false })
      setTimesheets(await timesheetService.getTimesheetsOfTheDay())
    }

    // const currentSort = sortBy.length > 0 ? sortBy[0] : null
    // const sortField = currentSort ? currentSort.id : null
    // const sortDirection = currentSort ? (currentSort.desc ? 'desc' : 'asc') : null

    // console.log("Current Sort Field:", sortField)
    // console.log("Current Sort Direction:", sortDirection)
    // save timesheet every toggle
    await timesheetService.updateTimesheet({ ...timesheet, duration: duration, running: !isRunning })
    setTimesheets(await timesheetService.getTimesheetsOfTheDay())
  };

  const saveData = async (e: any) => {
    console.log(clockButtonRef, e.relatedTarget)
    // --- START Minimal Changes for your request ---
    // Check if the blur event's relatedTarget (the element receiving focus) is the clock button
    const isClockButtonClick = e.relatedTarget?.closest?.('[data-clock-button]')
    if (e.type === "blur" && isClockButtonClick) {
      // If it's a blur due to clicking the clock button, do not save and do not exit edit mode.
      return; // Stop the function here
    }
    // --- END Minimal Changes ---

    setEditing(false); // This will only be reached if the blur was NOT caused by the clock button

    const input = e.target.value;
    // check if input is in HH:mm:ss or {number}H/{number}M format
    if (timesheetService.isValidTimeFormat(input)) {
      // if valid time format, convert to seconds
      const parsedTime = timesheetService.parseTimeWithSuffix(input);
      const seconds = timesheetService.timeToSeconds(parsedTime);

      // if running, update the startTime
      if (isRunning) {
        localStorage.setItem("fuse-startTime", JSON.stringify(new Date()));
        setStartTime(new Date());
      } else {
        // localStorage.removeItem("fuse-startTime");
        // setStartTime(null);
      }

      setDuration(seconds);
      timesheet.duration = seconds;

      updateData(timesheet.id!, "duration", seconds);
    } else {
      // show toast message
      toast.error("Invalid time format. Please use HH:mm:ss or {number}H/{number}M format.", {
        position: "top-right",
      })
      setDuration(timesheet.duration || 0);

    }
  }

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center" >
      {
        isEditing ? (
          <div className="flex items-center">
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              className="w-48 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary2 dark:bg-gray-800"
              value={durationStr}
              onChange={(e) => {
                const input = e.target.value;
                setDurationStr(input);
                const seconds = Number(input);
                if (!isNaN(seconds)) {
                  setDuration(seconds);
                }
              }}
              onBlur={(e) => {
                saveData(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveData(e);
                }
              }}
              autoFocus
            />

            {/* The new button with Font Awesome icon */}
            <AddTimeButton ref={clockButtonRef} inputRef={inputRef} formData={timesheet} durationStr={durationStr} setDurationStr={setDurationStr} />
          </div>
        ) : (<div className="relative group inline-block">
          <span
            onDoubleClick={() => {
              setEditing(true);
              setDurationStr(timesheetService.formatDuration(duration));
            }}
            className="inline-block pr-6 mr-2" // Added right padding to make space for the icon
          >
            {timesheetService.formatDuration(duration)}
          </span>
          <FaPencilAlt
            className="
              absolute top-1/2 right-4 transform -translate-y-1/2
              h-4 w-4 text-gray-500 cursor-pointer
              hidden group-hover:block transition-opacity duration-200
              
            "
            onClick={() => {
              setEditing(true);
              setDurationStr(timesheetService.formatDuration(duration));
            }}
            aria-label="Edit duration"
          />
        </div>)
      }


      <button
        onClick={toggleTimer}
        className={`text-primary2 hover:text-primary transition-transform duration-300 ${isRunning ? "animate-pulse" : ""
          }`}
      >
        {isRunning ? (
          <Pause size={24} className="animate-pulse" />
        ) : (
          <Play
            size={24}
            className="hover:text-primary"
          />
        )}
      </button>

    </div >
  );
};

export default TimerComponent;