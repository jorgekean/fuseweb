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
import { BillingManagerModel } from "../../models/BillingManager"
import { Save } from "react-feather"

const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration / 3600000)
  const minutes = Math.floor((duration % 3600000) / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

const BillingManagerForm: React.FC<{
  billingDate: Date
  toggleTimesheetChanged: () => void
}> = ({ billingDate, toggleTimesheetChanged }) => {
  const initialData = {
    client: "",
    taskCode: "",
    projectCode: "",
    actualHours: 0,
    allocatedHours: 0,
    billingType: undefined,
  }

  const [formData, setFormData] = useState<BillingManagerModel>(initialData)

  useEffect(() => {
    console.log(billingDate)
  }, [billingDate])

  const db = DexieUtils<BillingManagerModel>({
    tableName: "billingManager",
    onCreating: () => console.log("chaging from Form"),
  })

  const addBilling = async () => {
    const newBilling: BillingManagerModel = formData
    const id = await db.add(newBilling)

    toggleTimesheetChanged()
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setFormData((prevState) => ({ ...prevState, [name]: value }))
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault()
    await addBilling()
    setFormData(initialData)
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group as={Row} className="">
        <Col sm={7}>
          <Form.Control
            name="client"
            value={formData.client}
            onChange={handleInputChange}
            placeholder="Client"
          />
        </Col>
        <Col sm={2}>
          <Form.Control
            name="projectCode"
            value={formData.projectCode}
            onChange={handleInputChange}
            placeholder="Project Code"
            autoComplete="off"
          />
        </Col>
        <Col sm={2}>
          <Form.Control
            name="taskCode"
            value={formData.taskCode}
            onChange={handleInputChange}
            placeholder="Task Code"
          />
        </Col>
        {/* <Col sm={2}>
          <Form.Control
            name="billingType"
            value={formData.billingType}
            onChange={handleInputChange}
            placeholder="Billing Type"
          />
        </Col>
        <Col sm={2}>
          <Form.Control
            name="allocatedHours"
            value={formData.allocatedHours}
            onChange={handleInputChange}
            placeholder="Allocated Hours"
          />
        </Col> */}
        <Col sm={1}>
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

export default BillingManagerForm
