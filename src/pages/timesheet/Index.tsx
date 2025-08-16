// import React, { useState } from "react"
// import { Card, Col, Container, Row } from "react-bootstrap"
// import TimesheetTable from "../components/timesheets/TimesheetTable"
// import TimesheetForm from "../components/timesheets/TimesheetForm"
// import Calendar from "../components/timesheets/Calendar"
// import { useGlobalContext } from "../contexts/GlobalContext"
// import { Clock, Watch } from "react-feather"
// import { TimesheetService } from "../components/timesheets/TimesheetService"

import React from "react"
import TimesheetForm from "./TimesheetForm"
import TimeTrackingTable from "./TimeTrackingTable"
import Calendar from "./Calendar";
import TimesheetContextProvider from "./TimesheetContext";



const Timesheet = () => {

    return (
        <React.Fragment>
            <TimesheetContextProvider>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky top-0 z-20">
                    <Calendar />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky top-24 z-10">
                    <TimesheetForm />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <TimeTrackingTable />
                </div>
            </TimesheetContextProvider>
        </React.Fragment>
    )
}

export default Timesheet
