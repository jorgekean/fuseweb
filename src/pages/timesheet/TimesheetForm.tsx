import React, { useEffect, useState } from "react"
import { FaSave, FaTimes } from "react-icons/fa"
import FuseTextArea from "../../components/shared/forms/FuseTextArea"
import FuseCombobox from "../../components/shared/forms/FuseCombobox"
import FuseInput from "../../components/shared/forms/FuseInput"
import { useGlobalContext } from "../../context/GlobalContext"
import { TimesheetData } from "../../models/Timesheet"
import DexieUtils from "../../utils/dexie-utils"
import { BillingManagerModel } from "../../models/BillingManager"
import { ErrorModel } from "../../models/ErrorModel"
import { TimesheetService } from "./TimesheetService"
import toast from "react-hot-toast"
import { MiscTimeData } from "../../models/MiscTime"
import { Clock } from "react-feather"
import SaveButton from "../../components/buttons/SaveButton"
import { FaUserClock } from "react-icons/fa6"
import CancelButton from "../../components/buttons/CancelButton"
import FuseTooltip from "../../components/shared/FuseTooltip"
import AddTimeButton from "./AddTimeButton"

interface TimesheetFormProps { }

interface FormData {
  client: string | null
  taskDescription: string
  durationStr: string
}

const TimesheetForm: React.FC<TimesheetFormProps> = () => {
  const {
    timesheetDate,
    timesheets,
    editingTimesheet,
    setTimesheets,
    setEditingTimesheet,
    runningTimesheet,
    setRunningTimesheet,
    timesheetWorkLocation,
    setMiscTime,
    showComments
  } = useGlobalContext()

  const initialFormData = {
    client: null,
    taskDescription: "",
    comments: "",
    durationStr: "00:00:00",
    duration: undefined,
    timesheetDate: timesheetDate,
    running: true,
    createdDate: new Date(),
    workLocation: null,
    isSynced: 0
  }

  const [formData, setFormData] = useState<TimesheetData>(initialFormData)
  const [isShiftEnterPressed, setIsShiftEnterPressed] = useState(false)
  const [projectOptions, setProjectOptions] = useState<BillingManagerModel[]>([])
  const [clientText, setClientText] = useState("")

  // const handleQueryChange = (query: string) => {
  //     setClientText(query);
  //     // console.log("Current query:", query);  // Or handle it any way you want
  // };

  const db = DexieUtils<TimesheetData>({
    tableName: "timesheet",
  })
  const billingManagerDB = DexieUtils<BillingManagerModel>({
    tableName: "billingManager",
  })
  const errorDB = DexieUtils<ErrorModel>({
    tableName: "fuse-logs",
  })
  const miscDB = DexieUtils<MiscTimeData>({
    tableName: "miscTime",
  })

  const timesheetService = TimesheetService()

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && event.shiftKey) {
      setIsShiftEnterPressed(true)
    }
  }

  const handleNewBillingSave = async (query: string) => {
    // Check if billing entry already exists for the given client - this is to handle archived data
    const existingBilling = (await billingManagerDB.getAll()).find(x => x.client === query);
    if (existingBilling) {
      toast.error("You are about to use an archived project. Unarchive the project in billing manager and double check project codes.", {
        position: "top-right",
        duration: 5000,
      });
      return;
    }

    // Create a new billing entry
    const newBilling = {
      client: query,
      taskCode: "",
      projectCode: "",
    };

    const id = await billingManagerDB.add(newBilling);
    toast.success(
      "New Billing saved! Go to Billing Manager page to update the project and task code.",
      { position: "top-right", duration: 5000 }
    );

    await populateBillingOptions();
  };

  const populateBillingOptions = async () => {
    // Fetch and populate options
    const billings = (await billingManagerDB.getAll()).filter(
      (x) => !x.isArchived
    ).sort((a, b) => {
      if (a.client < b.client) return -1; // a comes before b
      if (a.client > b.client) return 1;  // a comes after b
      return 0; // a and b are equal
    });
    setProjectOptions(billings)
  }

  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      ["timesheetDate"]: timesheetDate,
      // running:
      //   timesheetDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0), // set true if current date, else false
    }))
  }, [timesheetDate])

  useEffect(() => {
    try {
      const fetchData = async () => {
        // Fetch and populate options
        await populateBillingOptions()

        // Populate form data if editing
        if (editingTimesheet) {
          const editingTimesheetDisplay = {
            ...editingTimesheet!,
            duration: editingTimesheet?.duration,
            durationStr: timesheetService.formatDuration(
              editingTimesheet?.duration!
            ),
          }

          setFormData(editingTimesheetDisplay)
        } else {
          setFormData(initialFormData)
        }
      }
      fetchData()
    } catch (error: any) {
      console.error("Error fetching data:", error)

      errorDB.add({
        message: error.message,
        stack: error.stack || String(error), // Use stack or stringify error
        timestamp: new Date(),
      })
    }
  }, [editingTimesheet])

  const addTimesheet = async () => {

    const newTimesheet: TimesheetData = formData

    try {
      // set timesheet work location
      newTimesheet.workLocation = timesheetWorkLocation

      // parse timesheet to accomodate H and M suffix
      const parsedTime = timesheetService.parseTimeWithSuffix(newTimesheet.durationStr!)
      newTimesheet.duration = timesheetService.timeToSeconds(parsedTime)

      // if shift+enter is pressed, default to running false
      if (isShiftEnterPressed) {
        newTimesheet.running = false
      }

      if (editingTimesheet) {
        // Update existing timesheet
        newTimesheet.id = editingTimesheet.id
        // newTimesheet.clientStr = newTimesheet.clientStr ?? clientText
        await timesheetService.updateTimesheet(newTimesheet!)
      } else {
        // stop all running timesheets for the selected date
        await timesheetService.processPrevRunningTimesheet()

        // const isToday = timesheetDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
        // if (isToday) {
        //   localStorage.setItem("fuse-startTime", JSON.stringify(new Date()))
        //   newTimesheet.startTime = new Date()
        // } else {
        //   newTimesheet.running = false
        //   // localStorage.removeItem("fuse-startTime")
        // }

        // Add new timesheet
        newTimesheet.createdDate = new Date()
        newTimesheet.duration = !newTimesheet.duration
          ? 0
          : newTimesheet.duration
        const id = await db.add(newTimesheet)

      }

      if (newTimesheet.running) {
        localStorage.setItem("fuse-startTime", JSON.stringify(new Date()))
        localStorage.setItem("fuse-runningTimesheet", JSON.stringify(newTimesheet));
        newTimesheet.startTime = new Date()
      } else {

        // localStorage.removeItem("fuse-runningTimesheet")
        // localStorage.removeItem("fuse-startTime")
      }

      // Refresh timesheets for the day
      setTimesheets(await timesheetService.getTimesheetsOfTheDay())
      // setEditingTimesheet(undefined)

      setFormData({
        ...initialFormData,
        running:
          timesheetDate.setHours(0, 0, 0, 0) ===
          new Date().setHours(0, 0, 0, 0),
      })
    } catch (error: any) {
      toast.error("Error adding timesheet entry!", { position: "top-right" })
      console.error("Failed to add timesheet:", error)

      errorDB.add({
        message: error.message,
        stack: error.stack || String(error), // Use stack or stringify error
        timestamp: new Date(),
      })
    }

    setIsShiftEnterPressed(false)
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target

    setFormData((prevState) => ({ ...prevState, [name]: value }))
  }

  const convertToSeconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(":").map(Number)
    return hours * 3600 + minutes * 60 + seconds
  }

  const handleDurationChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
      duration: convertToSeconds(value),
    }))
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault()

    // if not task description and client, show toast message
    if (!formData.taskDescription && !formData.client) {
      toast.error("Please enter a task description or select a project.", {
        position: "top-right",
      })
      return
    }

    if (timesheetService.isValidTimeFormat(formData.durationStr!)) {
      await addTimesheet()
    } else {
      // show toast message
      toast.error("Invalid time format. Please use HH:mm:ss format.", {
        position: "top-right",
      })
    }
    setEditingTimesheet(undefined)
    // setFormData({ ...formData, client: null })
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col h-full space-y-4">
      <div className="flex space-x-2 mb-2">
        {/* Task Description */}
        <div className="flex flex-col flex-1">
          <FuseInput
            name="taskDescription"
            value={formData.taskDescription}
            onChange={handleInputChange}
            placeholder="What are you working on?"
          />
        </div>

        {/* Comments */}
        {
          showComments && (
            <div className="flex flex-col flex-1">
              <FuseInput
                name="comments"
                value={formData.comments!}
                onChange={handleInputChange}
                placeholder="Additional comments"
              />
            </div>
          )
        }

        {/* Client Selection with Combobox */}
        <div className="flex flex-col flex-1 max-w-96">
          <FuseCombobox
            // name="client"
            items={projectOptions}
            selectedItem={formData.client}
            onItemSelect={(value) =>
              setFormData({ ...formData, client: value })
            }
            placeholder="Select a Project"
            labelKey={(b) => (
              <div>
                <span className="">{b.client}</span>
                <div className="text-gray-500 text-sm">
                  ({b.projectCode} - {b.taskCode})
                </div>
              </div>
            )}
            getSearchableString={(b) => `${b.client}`}
            valueKey={"id"}
            // onQueryChange={handleQueryChange}
            onSaveQuery={handleNewBillingSave}
            resetFilterOnCaretClick={false}
          ></FuseCombobox>
        </div>

        {/* Duration Input */}
        <div className="flex items-center space-x-1 max-w-40">
          {/* FuseInput */}
          <FuseInput
            name="durationStr"
            value={formData.durationStr!}
            onChange={handleDurationChange}
            placeholder="00:00:00"
            type="text"
          // className="px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Dropdown Button */}
          <AddTimeButton formData={formData} setFormData={setFormData} />
        </div>

        {editingTimesheet && (
          <CancelButton label="Cancel" onClick={() => setEditingTimesheet(undefined)} icon={<FaTimes className="w-3 h-5" />} />
        )}

        <SaveButton label="Save" icon={<FaUserClock className="w-5 h-5" />} />
      </div>
    </form >
  )
}

export default TimesheetForm
