import React, { useEffect, useState } from "react"
import { ChevronDown, ToggleLeft, ToggleRight } from "react-feather" // Imported icons from react-feather
import { v4 as uuidv4 } from "uuid"
import { OracleUploadTask, useOracleUploadContext, Week } from "./OracleUploadContext"
import { OracleUploadService } from "./OracleUploadService"
import toast from "react-hot-toast"
import DexieUtils from "../../utils/dexie-utils"
import { ErrorModel } from "../../models/ErrorModel"
import { useGlobalContext } from "../../context/GlobalContext"
import FuseCombobox from "../../components/shared/forms/FuseCombobox"
import { TimesheetService } from "../timesheet/TimesheetService"
import { Switch } from "@headlessui/react"
import { TimesheetData } from "../../models/Timesheet"
import FuseTooltip from "../../components/shared/FuseTooltip"
import { GoMoveToEnd } from "react-icons/go"
import { FaTriangleExclamation } from "react-icons/fa6"


interface FilterComponentProps { }

const OracleUploadFilters: React.FC<FilterComponentProps> = () => {
  const errorDB = DexieUtils<ErrorModel>({ tableName: "fuse-logs" })

  const oracleuploadService = OracleUploadService()
  const timesheetService = TimesheetService()

  const [extensionInstalled, setExtensionInstalled] = useState(true)
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null)
  const [weeks, setWeeks] = useState<Week[]>([])
  const { includeCommentsOnUpload } = useGlobalContext()
  const {
    toUpload,
    setToUpload,
    selectedWeek,
    selectedDays,
    setSelectedWeek,
    setSelectedDays,
    total,
  } = useOracleUploadContext()
  // const { modalState, setModalState } = useGlobalContext()  

  const generateWeeks = (): Week[] => {
    const weeks: Week[] = []
    try {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 2)
      startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7))
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 2)
      endDate.setDate(endDate.getDate() - ((endDate.getDay() + 6) % 7) + 6)

      for (
        let date = new Date(endDate);
        date >= startDate;
        date.setDate(date.getDate() - 7)
      ) {
        const startOfWeek = new Date(date)
        const endOfWeek = new Date(date)
        endOfWeek.setDate(endOfWeek.getDate() + 6)
        weeks.push({
          label: oracleuploadService.formatLabel(startOfWeek, endOfWeek),
          value: `${oracleuploadService.formatDate(
            startOfWeek
          )}|${oracleuploadService.formatDate(endOfWeek)}`,
        })
      }
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to generate weeks")
      errorDB.add({
        message: error.message,
        stack: error.stack || String(error),
        timestamp: new Date(),
      })
    }
    return weeks
  }

  useEffect(() => {
    // Check if the extension is installed
    if (!chrome.runtime) {
      setExtensionInstalled(false)
    }

    const weeksLocal = generateWeeks()
    setWeeks(weeksLocal)

    const defaultWeek = weeksLocal.find((week) => {
      const [start, end] = week.value.split("|")
      const today = oracleuploadService.formatDate(new Date())
      return today >= start && today <= end
    })
    setCurrentWeek(defaultWeek || null)
    setSelectedWeek(defaultWeek!)

  }, [])

  useEffect(() => {
    // Split the selectedWeek into startDate and endDate
    // alert(selectedWeek)
    const [start, end] = selectedWeek?.value.split("|") || []
    const startDate = start ? new Date(start) : null
    const endDate = end ? new Date(end) : null

    // load timesheet data to upload
    const fetchData = async () => {
      try {
        const timesheetsToUpload = await timesheetService.getTimesheetsToUpload(
          startDate!,
          endDate!,
          selectedDays,
          includeCommentsOnUpload!
        )

        // format hours to 2 decimal places
        const formatDatedTimesheets = timesheetsToUpload.map((timesheet: any) => {
          const updatedTimesheet = { ...timesheet };

          Array.from(selectedDays).forEach((day) => {
            const key = `${day.slice(0, 3).toLowerCase()}Hours`;
            const value = Number(updatedTimesheet[key] || 0);
            const formattedValue = parseFloat(value.toFixed(1)); // format to 2 decimal places
            updatedTimesheet[key] = formattedValue > 0 ? formattedValue : ""; // format to 1 decimal, keep as number, set balnk if 0           
          });

          return updatedTimesheet;
        });

        // make sure hours field set to blank if 0
        const finalToUpload = formatDatedTimesheets.map((item: OracleUploadTask) => {
          const updatedItem = { ...item };
          if (updatedItem.sunHours === 0) updatedItem.sunHours = "";
          if (updatedItem.monHours === 0) updatedItem.monHours = "";
          if (updatedItem.tueHours === 0) updatedItem.tueHours = "";
          if (updatedItem.wedHours === 0) updatedItem.wedHours = "";
          if (updatedItem.thuHours === 0) updatedItem.thuHours = "";
          if (updatedItem.friHours === 0) updatedItem.friHours = "";
          if (updatedItem.satHours === 0) updatedItem.satHours = "";
          return updatedItem;
        })

        setToUpload(finalToUpload)

      } catch (error: any) {
        console.error(error)
        toast.error("Failed to fetch timesheets to upload")

        errorDB.add({
          message: error.message,
          stack: error.stack || String(error), // Use stack or stringify error
          timestamp: new Date(),
        })
      }
    }
    fetchData()
  }, [selectedDays, selectedWeek, includeCommentsOnUpload])

  // useEffect(() => {
  //   // filter out selected days with 0 hours
  //   console.log(total, "total")
  //   if (total) {
  //     const filteredDays = selectedDays.filter((day) => {
  //       const dayKey = `${day.slice(0, 3).toLowerCase()}Hours`
  //       return total[dayKey] > 0
  //     })

  //     // setSelectedDays(filteredDays)
  //   }
  // }, [total])

  // const groupTimesheets = (filteredTimesheets: OracleUploadTask[], selectedDays: string[]) => {
  //   const groupedTimesheets: { [key: string]: OracleUploadTask } = {};

  //   filteredTimesheets.forEach((timesheet) => {
  //     const key = `${timesheet.client}-${timesheet.projectCode}-${timesheet.taskCode}-${timesheet.taskDescription}-${timesheet.workLoc}`;
  //     console.log(key, "key")
  //     if (!groupedTimesheets[key]) {
  //       groupedTimesheets[key] = {
  //         client: timesheet.client,
  //         projectCode: timesheet.projectCode!,
  //         taskCode: timesheet.taskCode!,
  //         taskDescription: timesheet.taskDescription,
  //         workLoc: timesheet.workLoc,
  //         sunHours: 0,
  //         monHours: 0,
  //         tueHours: 0,
  //         wedHours: 0,
  //         thuHours: 0,
  //         friHours: 0,
  //         satHours: 0,
  //         totalHours: 0,
  //       };
  //     }

  //     selectedDays.forEach((day) => {
  //       const dayKey = `${day.slice(0, 3).toLowerCase()}Hours`;
  //       const value = Number(timesheet[dayKey] || 0);

  //       groupedTimesheets[key][dayKey] += parseFloat(value.toFixed(1));
  //       groupedTimesheets[key].totalHours += parseFloat(value.toFixed(1));
  //     });
  //   });

  //   // Convert the groupedTimesheets object into an array and add id using uuidv4
  //   Object.keys(groupedTimesheets).forEach((key) => {
  //     const timesheet = groupedTimesheets[key];
  //     timesheet.id = uuidv4(); // Add unique ID to each timesheet
  //   });

  //   return Object.values(groupedTimesheets);
  // };


  const handleDayFilterChange = (day: string) => {
    // Toggle the day in selectedDays
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter((selectedDay) => selectedDay !== day)
      : [...selectedDays, day]

    setSelectedDays(newSelectedDays)
  }

  return (
    <>
      {!extensionInstalled && (
        <div className="w-full mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative" role="alert">
          <div className="flex items-center">
            <strong className="font-bold flex items-center mr-2">
              <span className="text-yellow-600 mr-1">&#9888;</span> Warning!
            </strong>
          </div>
          {/* Each <p> tag now stands alone, ensuring it takes up its own line */}
          <p className="mt-1">Oops! Looks like the Oracle Uploader extension isn’t installed or can’t be found.</p>
          <p className="mt-1">To unlock the full magic, go ahead and install it. Need help? Just click the little help icon above – it’s got all the secrets!</p>
        </div>
      )}
      <div className="flex flex-col md:flex-row items-start md:items-center mb-3 space-y-2 md:space-y-0 md:space-x-4 max-w-full">
        {/* Wider container for the FuseCombobox */}
        <div className="w-full md:w-1/3">
          {" "}
          {/* Adjust width as needed */}
          <FuseCombobox
            items={weeks}
            selectedItem={selectedWeek}
            onItemSelect={(value) => setSelectedWeek(value)}
            placeholder="Select Week to Upload"
            labelKey="label"
            valueKey="value"
          />
        </div>

        {/* icon button to go to current week */}
        <FuseTooltip content="Go to current week timesheets">
          <button
            type="button"
            onClick={() => { setSelectedWeek(currentWeek!) }}
            className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-300"
          >
            <GoMoveToEnd className="h-5 w-5" />
          </button>
        </FuseTooltip>
        {/* Toggle icons for day filtering */}
        <div className="flex flex-wrap gap-1 md:w-2/3">
          {" "}
          {/* Adjust width as needed */}
          {[
            { value: "Sunday", label: "Sun" },
            { value: "Monday", label: "Mon" },
            { value: "Tuesday", label: "Tue" },
            { value: "Wednesday", label: "Wed" },
            { value: "Thursday", label: "Thu" },
            { value: "Friday", label: "Fri" },
            { value: "Saturday", label: "Sat" },
          ].map((day) => (
            <div key={day.value} className="ml-5">
              <Switch
                checked={selectedDays.includes(day.value)}
                onChange={() => handleDayFilterChange(day.value)}
                className={`${selectedDays.includes(day.value) ? "bg-primary2" : "bg-gray-300"
                  } relative inline-flex items-center h-6 rounded-full w-12 transition-colors duration-200 ease-in-out`}
              >
                <span
                  className={`${selectedDays.includes(day.value)
                    ? "translate-x-6"
                    : "translate-x-1"
                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
                />
              </Switch>

              <span className="text-primary font-medium ml-1">{day.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default OracleUploadFilters
