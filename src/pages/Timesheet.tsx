import React, { useState } from "react"
import { Card, Col, Container, Row } from "react-bootstrap"
import { Helmet } from "react-helmet-async"
import TimesheetTable from "../components/timesheets/TimesheetTable"
import TimesheetForm from "../components/timesheets/TimesheetForm"
import Calendar from "../components/timesheets/Calendar"

const Timesheet = () => {
  const [timesheetDate, setTimesheetDate] = useState<Date | undefined>(
    undefined
  )
  const [timesheetChanged, setTimesheeChanged] = useState<boolean | undefined>(
    undefined
  )

  const updateTimesheetDate = (newState: Date) => {
    setTimesheetDate(newState)
  }

  const toggleTimesheetChanged = () => {
    setTimesheeChanged(!timesheetChanged)
  }

  return (
    <React.Fragment>
      {/* <Helmet title="Question" /> */}
      <Container fluid className="p-0">
        {/* <h1 className="h3 mb-3">Create your account</h1> */}

        <Row>
          <Col sm="3">
            <Card className="">
              <Card.Body>
                <Calendar updateTimesheetDate={updateTimesheetDate} />
              </Card.Body>
            </Card>
          </Col>
          <Col sm="9">
            {/* form here */}
            <Card className="mb-2">
              <Card.Body>
                {timesheetDate && (
                  <TimesheetForm
                    timesheetDate={timesheetDate as Date}
                    toggleTimesheetChanged={toggleTimesheetChanged}
                  />
                )}
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                {timesheetDate && (
                  <TimesheetTable
                    timesheetDate={timesheetDate as Date}
                    timesheetChanged={timesheetChanged as boolean}
                  />
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  )
}

export default Timesheet
