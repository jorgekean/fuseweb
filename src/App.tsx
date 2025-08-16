import { useRoutes } from "react-router-dom"
import { debounce } from "lodash"
import "./App.css"
import AdminLayout from "./components/layouts/AdminLayout"
import Content from "./components/layouts/Content"
import routes from "./route"
import { useCallback, useEffect, useState } from "react"
import { SettingModel } from "./models/SettingModel"
import { ErrorModel } from "./models/ErrorModel"
import DexieUtils from "./utils/dexie-utils"
import { useGlobalContext } from "./context/GlobalContext"
import { useTheme } from "./context/ThemeContext"
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest } from "./utils/auth.config";
import LoginPage from "./components/layouts/LoginPage"
import { EXTENSION_ID } from "./utils/extensions.util"
import { TimesheetService } from "./pages/timesheet/TimesheetService"
import { MiscTimeData } from "./models/MiscTime"
import { isBrandNewDay } from "./utils/data-checker"
import { apiUrl } from "./utils/constants"
import { TimesheetData } from "./models/Timesheet"
import { changelogs } from "../changelogs.json"
import { FaBullhorn, FaHornbill, FaSpeakerDeck } from "react-icons/fa"
import Changelog from "./components/shared/changelogs/Changelogs"
import ChangelogsTitle from "./components/shared/changelogs/ChangelogsTitle"
import { setItemWithExpiration } from "./utils/util"
import { timeOptions } from "./utils/constants"
import ModalFooterWithDropdown from "./components/shared/ModalFooterWithDropdown"

function App() {
  const { accounts, instance } = useMsal();
  const activeAccount = instance.getActiveAccount();


  const content = useRoutes(routes)

  const { modalState, timezone, timesheetDate, setModalState, setTimesheetDate, setTimesheets, setShowComments, setTimezone, setShowAnnouncementBadge } = useGlobalContext()

  const db = DexieUtils<TimesheetData>({ tableName: "timesheet" });
  const billingDB = DexieUtils<TimesheetData>({ tableName: "billingManager" });
  const settingsDB = DexieUtils<SettingModel>({
    tableName: "settings",
  })
  const miscDB = DexieUtils<MiscTimeData>({
    tableName: "miscTime",
  })
  const errorDB = DexieUtils<ErrorModel>({
    tableName: "fuse-logs",
  })

  const timesheetService = TimesheetService()

  // prmpt brand new day and restore data if needed test

  const yesClickOnBrandNewDay = async () => {
    // remove the copied flag, so if brand new day is clicked, it will copy the previous day
    localStorage.removeItem("fuse-timesheets-copied");

    localStorage.setItem("fuse-miscTime", JSON.stringify(new Date()))

    // make sure to stop all running tasks
    // await timesheetService.stopAllRunningTasks();
    await timesheetService.processPrevRunningTimesheet()

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setTimesheetDate(today);
    localStorage.setItem("prompt-brand-new-day", today.toISOString());

    setTimesheets([])

    setModalState({ ...modalState, showModal: false });

    // Check if there's already an entry for the given timesheetDate - for refactor?
    const allTimers = await miscDB.getAll()
    const miscTimer = allTimers.find(
      (f) =>
        f.timesheetDate.setHours(0, 0, 0, 0) ===
        today.setHours(0, 0, 0, 0)
    )
    // Add a new timer if it doesn't exist
    if (!miscTimer) {
      const newMiscTimer: MiscTimeData = {
        timesheetDate: today,
        duration: 0,
        running: false,
        startTime: new Date(),
      }
      await miscDB.add(newMiscTimer)
    }

    localStorage.removeItem("fuse-startTime")
    localStorage.removeItem("fuse-runningTimesheet")
  }

  const checkForNewDay = async () => {
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);

    // const lastPromptDate = localStorage.getItem("prompt-brand-new-day");
    // const isNewDay = !lastPromptDate || new Date(lastPromptDate).getTime() !== today.getTime();
    const isNewDay = isBrandNewDay(timezone);

    if (isNewDay) {
      setModalState({
        title: "Brand New Day",
        showModal: true,
        body: <div>Ready to jump to today?</div>,
        footer: (
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={async () => {

                setModalState({ ...modalState, showModal: false });

                // localStorage.setItem("fuse-miscTime", JSON.stringify(new Date()))

                // make sure to stop all running tasks
                // await timesheetService.stopAllRunningTasks();
                // await timesheetService.processPrevRunningTimesheet()

                // need this so taht te brand new day will not prompt again
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                localStorage.setItem("prompt-brand-new-day", today.toISOString());
              }}
              className="bg-gray-600 text-white rounded-md px-4 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              No
            </button>
            <button
              type="button"
              onClick={async () => {
                await yesClickOnBrandNewDay();

              }}
              className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Yes
            </button>
          </div>
        ),
      });
    }

    return isNewDay; // Return true if it's a brand new day
  };


  const checkIfHasNewAnnouncement = async () => {
    // check localStorage first
    // 1. Get the ID of the last announcement viewed by the user from localStorage
    const lastViewedVersion = localStorage.getItem("fuse-last-viewed-announcement-version");

    // 2. Compare it with the latest version in the changelogs
    const latestVersion = changelogs[0]?.version;
    if (latestVersion && lastViewedVersion !== latestVersion) {
      // 3. If they are different, show the announcement modal
      setModalState({
        title: <ChangelogsTitle />,
        showModal: true,
        size: "lg",
        body: (
          <Changelog changelogs={changelogs} />
        ),
        footer: (
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={async () => {
                setModalState({ ...modalState, showModal: false });
                // 4. Update the last viewed version in localStorage
                localStorage.setItem("fuse-last-viewed-announcement-version", latestVersion);
                setItemWithExpiration("fuse-announcement-effect-date", new Date().toISOString(), 4 * 60); // Set expiration for 4 hours   
                if (setShowAnnouncementBadge) {
                  setShowAnnouncementBadge(true);
                }

                handleCheckHierarchy(); // Re-check hierarchy after dismissing the modal

              }}
              className="bg-gray-600 text-white rounded-md px-4 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        ),
      });

      return true; // New announcement shown
    }
    return false; // No new announcement
  }

  const checkIfDataWiped = async () => {
    // check if localStorage has fuse-do-not-restore flag
    const doNotRestore = localStorage.getItem("fuse-do-not-restore");
    if (doNotRestore) {
      return false; // do not restore if the flag is set
    }


    const tsData = await db.getAll();
    const billingData = await billingDB.getAll();
    const noIndexDBData = tsData.length === 0 && billingData.length === 0;

    if (noIndexDBData) {
      // check server data
      const response = await fetch(`${apiUrl()}/cosmos/usersettings/restore/${accounts[0].username}`);
      const userSettingData = await response.json()

      return userSettingData && userSettingData.length > 0;// auto restore if no indexDB data but has server data
    }

    return false; // no wipe or restore needed
  }

  const promptDataWipe = async () => {
    const dataWipeDetected = await checkIfDataWiped();

    if (dataWipeDetected) {
      setModalState({
        title: "Data Wipe Detected",
        showModal: true,
        body: (
          <p>Hey {accounts[0].name}, it looks like your timesheet data was cleared. No worries — we can restore it from the server. Want to do that now?</p>
        ),
        footer: (
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setModalState({ ...modalState, showModal: false });

                handleCheckHierarchy(); // Re-check hierarchy after dismissing the modal

                localStorage.setItem("fuse-do-not-restore", "true");
              }}
              className="bg-gray-600 text-white rounded-md px-4 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              No, Thanks
            </button>
            <button
              type="button"
              onClick={async () => {
                setModalState({ ...modalState, showModal: false });

                await yesClickOnBrandNewDay();

                // Restore data from server
                try {
                  const getres = await fetch(`${apiUrl()}/cosmos/restore/${accounts[0].username}`)
                  const dataget = await getres.json()
                  console.log('Data from CosmosDB:', dataget);
                  await db.bulkAdd(dataget);

                  // check if there is running then get the most recent one and add localStorage starTime
                  const runningTimesheet = dataget.filter((item: TimesheetData) => item.running === true && item.startTime).sort((a: TimesheetData, b: TimesheetData) => new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime())[0];
                  if (runningTimesheet) {
                    localStorage.setItem("fuse-startTime", JSON.stringify(runningTimesheet.startTime));
                    localStorage.setItem("fuse-runningTimesheet", JSON.stringify(runningTimesheet));
                  }

                  const getresBilling = await fetch(`${apiUrl()}/cosmos/billingdata/restore/${accounts[0].username}`)
                  const datagetBilling = await getresBilling.json()
                  console.log("API Data:", datagetBilling)
                  await billingDB.bulkAdd(datagetBilling);

                  const getresSetting = await fetch(`${apiUrl()}/cosmos/usersettings/restore/${accounts[0].username}`)
                  const datagetSetting = await getresSetting.json()
                  console.log("API Data:", datagetSetting)

                  settingsDB.clear(); // Clear existing settings before restoring
                  await settingsDB.bulkAdd(datagetSetting);

                  // refresh the page after 0.5 seconds
                  setTimeout(() => {
                    window.location.reload();
                  }, 200);

                } catch (error) {
                  console.error('Error restoring data from Cosmos DB:', error);
                } finally {
                  handleCheckHierarchy(); // Re-check hierarchy after restoring data
                }
              }}
              className="bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Restore Now
            </button>
          </div>
        ),
      });
    }

    return dataWipeDetected; // No data wipe detected
  }


  const handleModal = () => {
    setModalState({
      showModal: true,
      title : 'Reminder',
      body: <div>It's time to submit your timesheet. Ready to proceed?</div>,
      footer: (
        <ModalFooterWithDropdown
          timeOptions={timeOptions}
          saveReminderTime={saveReminderTime}
          setModalState={setModalState}
          modalState={modalState}
        />
      ),
    })
  }

  // reminder notification
  const handleReminder = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayDateString = today.toLocaleDateString()
      const lastReminderDate = localStorage.getItem("lastReminderDate")
      const scheduledReminderTime = localStorage.getItem(
        "scheduledReminderTime"
      )
      const now = new Date()

      const isFriday = today.getDay() ===5
      const isMonthEnd = today.getDate() === new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
      // Check if the reminder should trigger
      const shouldTriggerReminder =
        ((isFriday || isMonthEnd) && scheduledReminderTime && new Date(scheduledReminderTime) <= now) ||
        // Trigger on Fridays or the last day of the month, except when dismissed(lastReminderDate not today)
        (!scheduledReminderTime &&
          lastReminderDate !== todayDateString &&
          (isFriday || isMonthEnd))

      if (shouldTriggerReminder) {
        // Show modal and reset state only if the user doesn't dismiss
        handleModal();
        // After the modal, clear scheduledReminderTime to avoid repeat triggers
        if (scheduledReminderTime) {
          localStorage.removeItem("scheduledReminderTime")
        }

        return true; // Reminder shown
      }
    } catch (error) {
      console.error("Error while showing reminder:", error)
    }

    return false;
  }

  const saveReminderTime = (minutes: number) => {
    const reminderTime = new Date()
    reminderTime.setMinutes(reminderTime.getMinutes() + minutes)
    localStorage.setItem("scheduledReminderTime", reminderTime.toISOString())
  }

  // useEffect(() => {
  //   // Trigger the reminder check on focus
  //   const handleFocus = () => {
  //     handleReminder()
  //   }

  //   window.addEventListener("focus", handleFocus)

  //   // Cleanup the event listener on component unmount
  //   return () => {
  //     window.removeEventListener("focus", handleFocus)
  //   }
  // }, [])

  // This is the core function that orchestrates the modal checks
  const handleCheckHierarchy = useCallback(async () => {
    if (!accounts || !accounts[0]?.username) {
      return;
    }

    // Only proceed if no modal is currently shown
    // The `onClose` of each modal will trigger the next step.
    // This initial check prevents multiple modals on first load or focus
    // if they all meet criteria at once.
    if (modalState.showModal) {
      return;
    }

    // 1. Check for new announcements
    const showedAnnouncement = await checkIfHasNewAnnouncement();
    if (showedAnnouncement) {
      // If an announcement modal is shown, it will handle closing itself
      // and then trigger the next step via its onClose.
      return;
    }

    // 2. If no announcement, check for data wipe
    const showedDataWipe = await promptDataWipe();
    if (showedDataWipe) {
      // If data wipe modal is shown, it will handle closing itself
      // and then trigger the next step via its onClose.
      return;
    }

    // 3. If neither, check for a new day
    const showedNewDay = await checkForNewDay();
    if (showedNewDay) {
      return;
    }

    //4. If oracle reminder is needed
    await handleReminder();

  }, [accounts, checkIfHasNewAnnouncement, promptDataWipe, checkForNewDay, handleReminder, modalState.showModal]); // Include modalState.showModal as a dependency if you want to re-run


  useEffect(() => {
    const fetchData = async () => {
      handleCheckHierarchy();
    }

    fetchData();

    // Add focus event listener to trigger the check on window focus
    const handleFocus = () => {
      // Only re-run the hierarchy check if no modal is currently active
      if (!modalState.showModal) {
        handleCheckHierarchy();
      }
    };

    window.addEventListener("focus", handleFocus);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [timesheetDate, accounts, handleCheckHierarchy, modalState.showModal]); // Re-run when timesheetDate or accounts change

  // end of prmpt brand new day and restore data if needed


  // Settings initial data
  const fuseSettingsInitialData: SettingModel[] = [
    {
      type: "copytimesheet",
      value: false,
    },
    {
      type: "showcomments",
      value: false,
    },
    {
      type: "includecommentsonupload",
      value: false,
    },
    {
      type: "autoSubmitTimesheet",
      value: true,
    },
    {
      type: "timezone",
      value: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    {
      type: "decimalmark",
      value: true,
    },
    {
      type: "isContractual",
      value: false,
    },
    {
      type: "worklocation",
      value: "",
    },
    {
      type: "oracleentity",
      value: { id: "3103", description: "3103" },
    },
  ]

  useEffect(() => {
    // set localStorage browser extensionid
    localStorage.setItem("FUSE_EXTENSIONID", EXTENSION_ID)


    const silentLogin = async () => {
      try {
        // Handle the redirect if it occurs
        const authResult = await instance.handleRedirectPromise();
        if (authResult) {
          console.log("Redirect handled:", authResult);
          return;
        }

        const tokenResponse = await instance.acquireTokenSilent(loginRequest);
        console.log("Token acquired silently:", tokenResponse);
        // You can use the token to make API calls here
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          // Fallback to interactive login if silent authentication fails          
          instance.loginPopup();
        } else {
          console.log("Authentication error:", error);
        }
      }
    };

    silentLogin();
  }, []);

  useEffect(() => {
    const handleSettings = debounce(async () => {
      try {
        const storedSettings = await settingsDB.getAll()

        for (const initialSetting of fuseSettingsInitialData) {
          const existingSetting = storedSettings.find(
            (setting) => setting.type === initialSetting.type
          )
          if (!existingSetting) {
            await settingsDB.add(initialSetting)
          }

          if (existingSetting) {
            // update global context if the setting is timezone
            if (existingSetting.type === "timezone") {
              setTimezone(initialSetting.value as string)
            } else if (existingSetting.type === "showcomments") {
              console.log("Setting showComments:", existingSetting)
              setShowComments(existingSetting.value as boolean)
            }
          }
        }
      } catch (error: any) {
        console.error("Error while syncing settings:", error)
      }
    }, 500) // Debounce with 500ms delay

    handleSettings() // Execute the function

    return () => {
      handleSettings.cancel() // Cleanup debounce on unmount or re-run
    }
  }, []) // This runs when settingsDB changes

  const { theme } = useTheme();
  useEffect(() => {
    // const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;

    // if (favicon) {
    //   // Change the favicon based on the template
    //   if (theme === 'WTWPurple') {
    //     favicon.href = '/Fuse_WTW_Purple.png';
    //   } else if (theme === 'WTWGreen') {
    //     favicon.href = '/Fuse_WTW_Green.png';
    //   } else {
    //     favicon.href = '/Fuse_WTW_Purple.png';
    //   }
    // }
  }, [theme]); // Update favicon when template changes


  const handleLoginRedirect = () => {
    instance.loginPopup({ ...loginRequest }).then(response => {
      //Process when logging in
    })
      .catch(error => {
        console.error('Login error:', error);
      });
  };

  return (
    <>
      <AuthenticatedTemplate>
        <AdminLayout>
          <Content>{content}</Content>
        </AdminLayout>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <>
          <LoginPage onClickLogin={handleLoginRedirect}></LoginPage>
        </>
      </UnauthenticatedTemplate>
    </>

  )
}

export default App
