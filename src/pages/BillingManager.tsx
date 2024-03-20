import React, { useState } from "react"
import { Card, Col, Container, Row } from "react-bootstrap"
import BillingManagerTable from "../components/billingmanager/BillingmanagerTable"
import TimesheetForm from "../components/timesheets/TimesheetForm"
import BillingManagerForm from "../components/billingmanager/BillingManagerForm"

const BillingManager = () => {
  const [billingManagerDate, setBillingManagerDate] = useState<
    Date | undefined
  >(new Date())
  const [billingManagerChanged, setBillingMangerChanged] = useState<
    boolean | undefined
  >(undefined)

  const updateBillingManagerDate = (newState: Date) => {
    setBillingManagerDate(newState)
  }

  const toggleBillingManagerChanged = () => {
    setBillingMangerChanged(!billingManagerChanged)
  }
  return (
    <React.Fragment>
      <Container fluid className="p-0">
        <Row>
          <Col sm="12">
            <Card className="mb-2">
              <Card.Body>
                {billingManagerDate && (
                  <BillingManagerForm
                    billingDate={billingManagerDate as Date}
                    toggleTimesheetChanged={toggleBillingManagerChanged}
                  />
                )}
              </Card.Body>
            </Card>
            <Card className="">
              <Card.Body>
                <BillingManagerTable
                  billingmanagerDate={new Date()}
                  billingmanagerChanged={false}
                ></BillingManagerTable>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  )
}

export default BillingManager
