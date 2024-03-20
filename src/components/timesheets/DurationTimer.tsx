import React, { useState, useEffect } from "react"
import { Button } from "react-bootstrap"
import { Play, Pause } from "react-feather"
import { TimesheetData } from "../../models/Timesheet"
import DexieUtils from "../../utils/dexie-utils"

interface DurationTimerProps {
  id: string // Unique identifier for the timer
  duration?: number | string // Initial duration (in seconds)
  startTimer: (id: string) => void // Function to start/stop the timer
  isRunning: boolean // Flag indicating whether the timer is currently running
}

const DurationTimer: React.FC<DurationTimerProps> = ({
  id,
  duration = 0,
  startTimer,
  isRunning,
}) => {
  // State to hold the current duration of the timer
  const [currentDuration, setCurrentDuration] = useState<number>(() => {
    // Initialize with the stored duration if available, otherwise use the provided duration
    const storedDuration = localStorage.getItem(`${id}-duration`)
    return storedDuration ? parseInt(storedDuration, 10) : duration
  })

  const db = DexieUtils<TimesheetData>({
    tableName: "timesheet",
  })

  // Effect to update the timer's duration when it's running
  useEffect(() => {
    if (isRunning) {
      // Start the timer
      const timer = setInterval(() => {
        setCurrentDuration((prevDuration: number) => Number(prevDuration) + 1) // Increment duration by 1 second
      }, 1000) // Update every second

      // Clean up function to clear the timer when component unmounts or when isRunning changes
      return () => clearInterval(timer)
    }
  }, [isRunning, id]) // Run the effect when isRunning or id changes

  // Effect to update the stored duration in localStorage
  useEffect(() => {
    localStorage.setItem(`${id}-duration`, currentDuration.toString())
  }, [currentDuration, id]) // Run the effect when currentDuration or id changes

  // Function to toggle the timer (start/stop)
  const toggleTimer = async () => {
    // save updated duration to indexDB
    var editingTimesheet = await db.get(id)
    console.log(id, editingTimesheet)
    if (editingTimesheet) {
      const storedDuration = localStorage.getItem(`${id}-duration`)
      console.log(storedDuration)
      const runningTimerDuration = storedDuration
        ? parseInt(storedDuration, 10)
        : 0
      editingTimesheet.duration = runningTimerDuration
      console.log(
        "editingTimesheet.duration",
        editingTimesheet.duration,
        runningTimerDuration,
        runningTimerDuration + editingTimesheet.duration
      )
      await db.update(editingTimesheet)
    }

    startTimer(isRunning ? "" : id) // Start/stop the timer based on its current state
  }

  // Function to format the duration into HH:mm:ss format
  const formatDuration = (durationInSeconds: number): string => {
    const durationNumber = Number(durationInSeconds)
    const hours = Math.floor(durationNumber / 3600)
    const minutes = Math.floor((durationNumber % 3600) / 60)
    const seconds = durationNumber % 60

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`
  }

  // Render the timer component
  return (
    <div className="d-flex align-items-center">
      <div className="me-2">{formatDuration(currentDuration)}</div>
      <Button
        size="sm"
        className={`btn ${isRunning ? "btn-fireworksdark" : "btn-ultraviolet"}`}
        onClick={toggleTimer}
      >
        {isRunning ? <Pause size={16} /> : <Play size={16} />}
      </Button>
    </div>
  )
}

export default DurationTimer
