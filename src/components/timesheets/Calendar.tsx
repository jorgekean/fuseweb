import React, { useEffect, useState } from "react"
import { Form } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css" // Import Bootstrap CSS
import "bootstrap/dist/js/bootstrap.bundle.min.js" // Import Bootstrap JS
import "react-datepicker/dist/react-datepicker.css" // Import Datepicker CSS
import DatePicker from "react-datepicker"

interface CalendarProps {
  updateTimesheetDate: (newState: Date) => void
}

const Calendar = ({ updateTimesheetDate }: CalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    updateTimesheetDate(selectedDate)
  }, [])

  const handleDateChange = (date: any) => {
    setSelectedDate(date)

    updateTimesheetDate(date)
  }

  return (
    <Form>
      <Form.Group controlId="formDate">
        <Form.Label>Timesheet Date:</Form.Label>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="MMMM d, yyyy"
          className="form-control" // Apply Bootstrap styling
          locale={"en"}
          showPopperArrow={false}
          inline
        />
      </Form.Group>
    </Form>
  )
}

export default Calendar
