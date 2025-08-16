import React, { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "react-feather"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { useGlobalContext } from "../../context/GlobalContext"
import locationData from "../../../src/worklocations.json"
import { SettingModel } from "../../models/SettingModel"
import DexieUtils from "../../utils/dexie-utils"
import { SettingsService } from "../settings/SettingsService"
import { TimesheetService } from "./TimesheetService"
import { TimesheetData } from "../../models/Timesheet"
import FuseCombobox from "../../components/shared/forms/FuseCombobox"
import { Button } from "@headlessui/react"
import { FaLocationArrow } from "react-icons/fa"
import FuseTooltip from "../../components/shared/FuseTooltip"
import { GoMoveToEnd } from "react-icons/go"

interface CalendarProps { }

const Calendar = ({ }: CalendarProps) => {
  const [isToday, setIsToday] = useState(false)

  const settingsDB = DexieUtils<SettingModel>({ tableName: "settings" })
  const timesheetsDB = DexieUtils<TimesheetData>({ tableName: "timesheet" })
  const {
    timesheetDate,
    setTimesheetDate,
    workLocations,
    setWorkLocations,
    timesheetWorkLocation,
    setTimesheetWorkLocation,
  } = useGlobalContext()

  const settingsService = SettingsService()
  const timesheetService = TimesheetService()

  useEffect(() => {
    // setTimesheetDate(timesheetDate);

    const fetchWorkLocations = async () => {
      try {
        setWorkLocations(locationData)

        const workLocationSetting = await settingsService.getSettingByType(
          "worklocation"
        )
        console.log("Work Location Setting:", workLocationSetting)
        if (workLocationSetting) {
          setTimesheetWorkLocation(
            locationData.find(
              (loc) => loc.id === workLocationSetting.value?.id
            ) || null
          )
        }

        const timesheets = await timesheetService.getTimesheetsOfTheDay()
        if (timesheets && timesheets.length > 0) {
          const firstTimesheetLocation = locationData.find((loc) =>
            timesheets
              .filter((timesheet) => timesheet.workLocation)
              .some((timesheet) => loc.id === timesheet.workLocation?.id)
          );
          setTimesheetWorkLocation(firstTimesheetLocation || null)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchWorkLocations()

    // set isToday
    setIsToday(timesheetDate?.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0))
  }, [timesheetDate])

  const handleDateChange = (date: any) => setTimesheetDate(date)

  const handlePrevDay = () => {
    if (timesheetDate) {
      const prevDate = new Date(timesheetDate)
      prevDate.setDate(prevDate.getDate() - 1)
      setTimesheetDate(prevDate)
    }
  }

  const handleNextDay = () => {
    if (timesheetDate) {
      const nextDate = new Date(timesheetDate)
      nextDate.setDate(nextDate.getDate() + 1)
      setTimesheetDate(nextDate)
    }
  }

  const goToToday = () => {
    setTimesheetDate(new Date())
  }

  const handleWorkLocationChange = async (selectedItem: any) => {
    setTimesheetWorkLocation(selectedItem)

    const tsOfTheDay = await timesheetService.getTimesheetsOfTheDay()
    tsOfTheDay.forEach(async (ts) => {
      ts.workLocation = selectedItem
      await timesheetsDB.update(ts)
    })
  }

  return (
    <form className="flex items-center">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={handlePrevDay}
          className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <DatePicker
          selected={timesheetDate}
          onChange={handleDateChange}
          dateFormat="MMMM d, yyyy - EEE"
          className={`${isToday ? 'font-bold bg-white' : 'bg-slate-200 font-bold'} text-center py-2 px-4 rounded-md border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-200`}
        />
        <button
          type="button"
          onClick={handleNextDay}
          className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-300"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <FuseTooltip content="Go to today's timesheet">
          <button
            type="button"
            onClick={goToToday}
            className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-300"
          >
            <GoMoveToEnd className="h-5 w-5" />
          </button>
        </FuseTooltip>
      </div>
      <div className="ml-auto w-1/3">
        <FuseCombobox
          placeholder="Select work location"
          items={workLocations}
          selectedItem={timesheetWorkLocation || null}
          onItemSelect={handleWorkLocationChange}
          labelKey={"description"}
          valueKey={"id"}
        />
      </div>
    </form>
  )
}

export default Calendar
