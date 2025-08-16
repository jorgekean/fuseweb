import React, { useEffect, useState } from "react"

import { useOracleUploadContext, Week } from "./OracleUploadContext"
import toast from "react-hot-toast"
import DexieUtils from "../../utils/dexie-utils"
import { ErrorModel } from "../../models/ErrorModel"
import { useGlobalContext } from "../../context/GlobalContext"
import { FaUpload } from "react-icons/fa6"
import { SettingsService } from "../settings/SettingsService"
import { BiMailSend } from "react-icons/bi"
import html2canvas from "html2canvas"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel } from "react-icons/fa"

interface OracleUploadFooterProps { }

const OracleUploadFooter: React.FC<OracleUploadFooterProps> = () => {
  const errorDB = DexieUtils<ErrorModel>({ tableName: "fuse-logs" })

  const settingsService = SettingsService()

  const { modalState, setModalState } = useGlobalContext()
  const { toUpload, selectedWeek } = useOracleUploadContext()
  const [extensionInstalled, setExtensionInstalled] = useState(true)
  // const { modalState, setModalState } = useGlobalContext()

  useEffect(() => {
    // Check if the extension is installed
    if (!chrome.runtime) {
      setExtensionInstalled(false)
    }
  }, [])

  const validateHours = () => {
    const dayTotals = {
      sunTot: 0,
      monTot: 0,
      tueTot: 0,
      wedTot: 0,
      thuTot: 0,
      friTot: 0,
      satTot: 0,
    }

    toUpload.forEach((timesheet: any) => {
      dayTotals.sunTot += Number(timesheet.sunHours || 0)
      dayTotals.monTot += Number(timesheet.monHours || 0)
      dayTotals.tueTot += Number(timesheet.tueHours || 0)
      dayTotals.wedTot += Number(timesheet.wedHours || 0)
      dayTotals.thuTot += Number(timesheet.thuHours || 0)
      dayTotals.friTot += Number(timesheet.friHours || 0)
      dayTotals.satTot += Number(timesheet.satHours || 0)
    })

    return Object.values(dayTotals).every((total) => total >= 8 || total === 0)
  }

  const updateDecimalMark = (filteredTimesheets: any[], settings: boolean) => {
    // Helper function to change decimal mark based on settings
    const decimalUpdate = (value: string | number): string => {
      const strValue = value.toString()
      // If settings is false, replace '.' with ','
      return settings ? strValue.replace(",", ".") : strValue.replace(".", ",")
    }

    // Create a copy of filteredTimesheets to avoid mutating the original array
    const updatedTimesheets = filteredTimesheets.map((timesheet) => {
      return {
        ...timesheet,
        sunHours: decimalUpdate(timesheet.sunHours), // Update Sunday's hours
        monHours: decimalUpdate(timesheet.monHours), // Update Monday's hours
        tueHours: decimalUpdate(timesheet.tueHours), // Update Tuesday's hours
        wedHours: decimalUpdate(timesheet.wedHours), // Update Wednesday's hours
        thuHours: decimalUpdate(timesheet.thuHours), // Update Thursday's hours
        friHours: decimalUpdate(timesheet.friHours), // Update Friday's hours
        satHours: decimalUpdate(timesheet.satHours), // Update Saturday's hours
      }
    })

    return updatedTimesheets
  }

  const handleMessage = async (event: any) => {
    const extensionId = localStorage.getItem("FUSE_EXTENSIONID") // use localStorage instead of hardcoding

    // Check if the browser is online, if not, prompt the user to connect to the internet before uploading
    if (!navigator.onLine) {
      setModalState({
        title: "Uploads",
        showModal: true,
        body: (
          <div>
            Whoops! It looks like you're offline. Please reconnect to the
            internet to continue with your upload.
          </div>
        ),
        footer: (
          <div>
            <button
              className="bg-gray-600 text-white rounded-md px-4 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={() => {
                setModalState({ ...modalState, showModal: false })
              }}
            >
              Got it!
            </button>
          </div>
        ),
      })

      return
    }

    try {
      // Modal confirmation function that returns a promise
      const confirmUpload = (message: string): Promise<boolean> => {
        return new Promise((resolve) => {
          setModalState({
            title: "Uploads",
            showModal: true,
            body: <div>{message}</div>,
            footer: (
              <div>
                <button
                  className="bg-gray-600 text-white rounded-md px-4 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  onClick={() => {
                    setModalState({ ...modalState, showModal: false })
                    resolve(false) // User clicked "No"
                  }}
                >
                  No
                </button>{" "}
                <button
                  className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  onClick={() => {
                    setModalState({ ...modalState, showModal: false })
                    resolve(true) // User clicked "Yes"
                  }}
                >
                  Yes
                </button>
              </div>
            ),
          })
        })
      }

      // Validate hours before uploading
      if (!validateHours()) {
        const continueUpload = await confirmUpload(
          "There are day(s) that are less than 8 hours, are you sure you want to proceed with the upload?"
        )

        if (!continueUpload) {
          return
        }
      }

      // Check if any records have missing projectCode or taskCode
      const hasMissingCodes = toUpload.some(
        (item: any) => !item.projectCode || !item.taskCode
      )

      if (hasMissingCodes) {
        const continueUpload = await confirmUpload(
          "There are records with missing Project Code or Task Code. If you wish to proceed they will not be uploaded. Do you want to continue?"
        )

        if (!continueUpload) {
          return
        }
      }

      const isContractual = await settingsService.getSettingByType(
        "isContractual"
      )
      const isAutoSubmitTimesheet = await settingsService.getSettingByType(
        "autoSubmitTimesheet")

      // Continue with the upload process

      const updatedToUpload = toUpload.map((item: any, index: number) => ({
        ...item,
        id: index + 1, // Setting id incrementally starting from 1
        projectWaitForChars: 10,
        taskWaitForChars: 7,
        typeWaitForChars: 7,
        comments: item.taskDescription, // Adding comments as taskDescription
        weekToUpload: selectedWeek?.value,
        workLocation: item.workLoc?.description,
        type: 'REG',// for CWK(contractual)
        isContractual: Boolean(isContractual?.value),
        autoSubmitTimesheet: Boolean(isAutoSubmitTimesheet?.value),
      }))

      const decimalMarkSett = await settingsService.getSettingByType(
        "decimalmark"
      )

      var updatedTimesheets = updateDecimalMark(
        updatedToUpload,
        decimalMarkSett?.value === true
      )

      // remove rows with blank projectCode or taskCode
      updatedTimesheets = updatedTimesheets.filter(
        (item: any) => item.projectCode && item.taskCode
      )

      // update updatedTimesheets to include oracle entity
      const oracleEntity = await settingsService.getSettingByType("oracleentity")
      updatedTimesheets = updatedTimesheets.map((item: any) => ({
        ...item,
        oracleEntity: oracleEntity?.value,
      }))
      updatedTimesheets.sort((a: any, b: any) => {
        const clientA = +a.projectCode;
        const clientB = +b.projectCode;
        if (clientA < clientB) return -1;
        else if (clientA > clientB) return 1;

        // If clients are the same, sort by projectCode and taskCode
        else {
          if (parseFloat(a.taskCode) < parseFloat(b.taskCode)) return -1;
          if (parseFloat(a.taskCode) > parseFloat(b.taskCode)) return 1;
          return 0;
        }

      });
      //Send message to Chrome extension
      chrome.runtime.sendMessage(
        extensionId,
        { action: "upload", data: updatedTimesheets },
        (response: any) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message)
          } else {
            console.log("Message sent to extension:", response)
          }
        }
      )
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to upload. Make sure the Fuse Oracle uploader extension is installed.")

      errorDB.add({
        message: error.message,
        stack: error.stack || String(error), // Use stack or stringify error
        timestamp: new Date(),
      })
    }
  }

  const captureScreenshot = async () => {
    try {
      const element = document.getElementById("oracle-upload-table") // Element to capture
      const canvas = await html2canvas(element!)
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      )

      if (blob && navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob as Blob,
          }),
        ])
        // show modal
        setModalState({
          title: "Screenshot",
          showModal: true,
          body: <div>Screenshot copied to clipboard! You can paste it in your email.</div>,
          footer: (
            <div>
              <button
                className="bg-primary text-white rounded-md px-4 py-2 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary2"
                onClick={() => {
                  setModalState({ ...modalState, showModal: false })

                  openEmail() // Open email app
                }}
              >
                Got it!
              </button>
            </div>
          ),
        })
      } else {
        alert("Clipboard API not supported in your browser.")
      }
    } catch (error: any) {
      console.error("Failed to capture or copy screenshot:", error)
      errorDB.add({
        message: error.message,
        stack: error.stack || String(error), // Use stack or stringify error
        timestamp: new Date(),
      })
    }
  }

  const openEmail = () => {
    const subject = encodeURIComponent(`Weekly Fuse Report - ${selectedWeek?.label}`)
    const body = encodeURIComponent("")
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const handleSendEmail = async () => {
    await captureScreenshot() // Copy screenshot to clipboard   
  }

  const handleExport = async () => {
    try {
      const rawData = await toUpload;
      if (rawData.length === 0) {
        toast.error("No data available to export.");
        return;
      }

      // parsed based on excel format
      // Period, Task, ProjectCode, TaskCode, SunHours, MonHours, TueHours, WedHours, ThuHours, FriHours, SatHours, TotalHours
      const formattedData = rawData.map((item) => ({
        Period: selectedWeek?.label,
        Task: item.taskDescription,
        ProjectCode: item.projectCode,
        TaskCode: item.taskCode,
        SunHours: item.sunHours,
        MonHours: item.monHours,
        TueHours: item.tueHours,
        WedHours: item.wedHours,
        ThuHours: item.thuHours,
        FriHours: item.friHours,
        SatHours: item.satHours,
        TotalHours: Number(item.sunHours) + Number(item.monHours) + Number(item.tueHours) + Number(item.wedHours) + Number(item.thuHours) + Number(item.friHours) + Number(item.satHours),
      }));

      // const processedData = formattedData.map(({ ...rest }) => {
      //   const capitalizedData: { [key: string]: any } = {};
      //   for (const key in rest) {
      //     const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      //     capitalizedData[capitalizedKey] = rest[key as keyof typeof rest];
      //   }
      //   return capitalizedData;
      // });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheets");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

      // filename with current date MM/dd/yyyy
      const date = new Date();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero if needed
      const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
      const year = date.getFullYear();
      const formattedDate = `${month}${day}${year}`;
      saveAs(blob, `TimesheetExport_${formattedDate}.xlsx`);
      toast.success("Data exported successfully as Excel!");
    } catch (error) {
      handleError(error, "Failed to export data.");
    }
  };

  const handleError = (error: any, message: string) => {
    toast.error(message, { position: "top-right" });
    errorDB.add({
      message: error.message,
      stack: error.stack || String(error),
      timestamp: new Date(),
    });
  };

  return (
    <div className="flex justify-end space-x-2">
      <button
        type="submit"
        onClick={handleMessage}
        disabled={!extensionInstalled}
        className={`flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium 
                         text-white
                        bg-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary2 ${!extensionInstalled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
      >

        <FaUpload size={16} />
        <span>Upload</span>
      </button>

      <button
        type="button"
        onClick={handleSendEmail}
        className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium 
                         text-white
                        bg-secondary rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary"
      >
        <BiMailSend size={20} />
        <span>Email</span>
      </button>

      <button
        type="button"
        onClick={handleExport}
        className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium 
                         text-white
                        bg-secondary2 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary"
      >
        <FaFileExcel size={20} />
        <span>Export</span>
      </button>
    </div>
  )
}

export default OracleUploadFooter
