import React, { useEffect, useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import {
  Form,
  FormGroup,
  FormLabel,
  FormControl,
  Col,
  Row,
  Button,
} from "react-bootstrap"
import DexieUtils from "../../utils/dexie-utils"
import { TimesheetData } from "../../models/Timesheet"
import { BillingManagerModel } from "../../models/BillingManager"
import { Save } from "react-feather"
import { Typeahead } from "react-bootstrap-typeahead"

const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration / 3600000)
  const minutes = Math.floor((duration % 3600000) / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

const TimesheetForm: React.FC<{
  timesheetDate: Date
  toggleTimesheetChanged: () => void
}> = ({ timesheetDate, toggleTimesheetChanged }) => {
  const initialFormData = {
    client: undefined,
    taskDescription: "",
    duration: 0,
    timesheetDate: timesheetDate,
    running: true,
    createdDate: new Date(),
  }

  const [formData, setFormData] = useState<TimesheetData>(initialFormData)

  const [options, setOptions] = useState<any[]>([])

  const billingManagerDB = DexieUtils<BillingManagerModel>({
    tableName: "billingManager",
  })

  useEffect(() => {
    const fetchData = async () => {
      // Fetch and populate options
      const billings = await billingManagerDB.getAll()
      const billingOptions = billings.map((b) => ({
        client: b.client,
        value: b.taskCode,
        projectCode: b.projectCode,
      }))
      setOptions(billingOptions)
    }
    fetchData()
  }, [])

  useEffect(() => {
    console.log(timesheetDate)
    setFormData((prevState) => ({
      ...prevState,
      ["timesheetDate"]: timesheetDate,
    }))
  }, [timesheetDate])

  const db = DexieUtils<TimesheetData>({
    tableName: "timesheet",
    onCreating: () => console.log("chaging from Form"),
  })

  const addTimesheet = async () => {
    const newTimesheet: TimesheetData = formData
    newTimesheet.createdDate = new Date()

    // parse duration
    if (formData.duration?.toString().toUpperCase().endsWith("H")) {
      const durationNumbers = formData.duration.toString().match(/\d+/g)
      if (durationNumbers) {
        const duration = parseInt(durationNumbers.join(""))
        // duration will now contain the concatenated number
        console.log(duration)
        newTimesheet.duration = duration * 60 * 60
      }
    } else if (formData.duration?.toString().toUpperCase().endsWith("M")) {
      const durationNumbers = formData.duration.toString().match(/\d+/g)
      if (durationNumbers) {
        const duration = parseInt(durationNumbers.join(""))
        // duration will now contain the concatenated number
        console.log(duration)
        newTimesheet.duration = duration * 60
      }
    }

    const id = await db.add(newTimesheet)

    // add on localstorage for timer
    localStorage.setItem(
      `${id}-duration`,
      newTimesheet.duration?.toString() as string
    )

    toggleTimesheetChanged()
    setFormData(initialFormData)
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setFormData((prevState) => ({ ...prevState, [name]: value }))
  }

  function handleClientChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = event.target
    console.log(name, JSON.parse(value))
    const selectedClient = JSON.parse(value)
    setFormData((prevState) => ({
      ...prevState,
      [name]: selectedClient,
      clientStr: selectedClient.client,
    }))
  }

  function handleClientTypeaheadChange(value: any) {
    console.log(value.selected[0])
    const selectedClient = value.selected[0]
    setFormData((prevState) => ({
      ...prevState,
      client: selectedClient,
      clientStr: selectedClient.client,
    }))
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault()
    await addTimesheet()
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group as={Row} className="">
        <Col sm={3}>
          <Typeahead
            id="clientTypeahead"
            labelKey={"client"}
            onChange={(selected) => {
              handleClientTypeaheadChange({ selected })
            }}
            options={options}
            selected={formData.client ? [formData.client] : []}
          />
        </Col>
        <Col sm={5}>
          <Form.Control
            name="taskDescription"
            value={formData.taskDescription}
            onChange={handleInputChange}
            placeholder="Task Description"
            autoComplete="off"
          />
        </Col>
        <Col sm={2}>
          <Form.Control
            name="duration"
            // value={formatDuration(formData.duration as number)}
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="Duration"
            autoComplete="off"
          />
        </Col>
        <Col sm={2}>
          <Button size="sm" type="submit" className="btn btn-primary">
            Save <Save size={16} />
          </Button>
        </Col>
      </Form.Group>
      {/* <Form.Group as={Row} className="mb-3">
        <Col sm={{ span: 10, offset: 2 }}>
          <Button size="sm" type="submit" className="btn btn-secondary">
            Save
          </Button>
        </Col>
      </Form.Group> */}
    </Form>
  )
}

export default TimesheetForm
