import React, { createContext, useContext, useReducer, ReactNode } from "react"
import { TimesheetData } from "../models/Timesheet"
import { BillingManagerModel } from "../models/BillingManager"

// Define action types
enum ActionType {
    SET_MODALSTATE = "SET_MODALSTATE",
    SET_TIMESHEET_DATE = "SET_TIMESHEET_DATE",
    SET_TIMESHEETS = "SET_TIMESHEETS",
    SET_EDITING_BILLING_MANAGER = "SET_EDITING_BILLING_MANAGER",
    SET_EDITING_TIMESHEET = "SET_EDITING_TIMESHEET",
    SET_WORK_LOCATIONS = "SET_WORK_LOCATIONS",
    SET_WORK_LOCATION = "SET_WORK_LOCATION",
    SET_TIMESHEET_WORK_LOCATION = "SET_TIMESHEET_WORK_LOCATION",
    SET_RUNNING_TIMESHEET = "SET_RUNNING_TIMESHEET",
    SET_RUNNING_TIMER_ID = "SET_RUNNING_TIMER_ID",
    SET_MISC_TIME = "SET_MISC_TIME",
    SET_TIMEZONE = "SET_TIMEZONE",
    SET_SHOWCOMMENTS = "SET_SHOWCOMMENTS",
    SET_INCLUDE_COMMENTS_ON_UPLOAD = "SET_INCLUDE_COMMENTS_ON_UPLOAD",
    UPDATE_TIMESHEET_ITEM = "UPDATE_TIMESHEET_ITEM",
    SET_SHOW_ANNOUNCEMENT_BADGE = "SET_SHOW_ANNOUNCEMENT_BADGE",
}

interface ModalState {
    title: string | ReactNode
    showModal: boolean
    body?: ReactNode
    footer?: ReactNode
    size?: "sm" | "md" | "lg" // Optional size for modal
}

const initialModalState: ModalState = {
    title: "",
    showModal: false,
    size: "sm", // Default size
}

// State interface with action type union
interface FuseData {
    timesheetDate: Date
    timesheets: TimesheetData[]
    editingTimesheet: TimesheetData | undefined
    editingBillingManager: BillingManagerModel | undefined
    workLocations: any[]
    workLocation: any // default location, settings page
    timesheetWorkLocation: any // per day timesheet location
    runningTimesheet: TimesheetData | undefined
    modalState: ModalState
    runningTimerId: string | null
    miscTime: number
    timezone: string
    showComments: boolean
    includeCommentsOnUpload?: boolean
    showAnnouncementBadge?: boolean // Optional, for announcement badge
    // todayBasedOnTimezone: Date
}

interface FuseDataContextValue extends FuseData {
    setModalState: (state: ModalState) => void
    setTimesheetDate: (date: Date) => void
    setTimesheets: (timesheets: TimesheetData[]) => void
    setEditingTimesheet: (timesheet: TimesheetData | undefined) => void
    setEditingBillingManager: (
        billingManager: BillingManagerModel | undefined
    ) => void
    setWorkLocations: (locations: any[]) => void
    setWorkLocation: (location: any) => void
    setTimesheetWorkLocation: (location: any) => void
    setRunningTimesheet: (timesheet: TimesheetData | undefined) => void
    setRunningTimerId: (id: string | null) => void
    setMiscTime: (durationStr: number) => void
    setTimezone: (timezone: string) => void
    setShowComments: (showComments: boolean) => void
    setIncludeCommentsOnUpload: (include: boolean) => void
    updateTimesheetItem: (payload: any) => void
    setShowAnnouncementBadge?: (show: boolean) => void // Optional for announcement badge
}

interface Action {
    type: ActionType
    payload?: any
}

const initialState: FuseData = {
    timesheetDate: new Date(new Date().setHours(0, 0, 0, 0)),
    timesheets: [],
    editingTimesheet: undefined,
    editingBillingManager: undefined,
    workLocations: [],
    workLocation: undefined,
    runningTimesheet: undefined,
    timesheetWorkLocation: undefined,
    modalState: initialModalState,
    runningTimerId: null,
    miscTime: 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Default timezone
    showComments: false, // Default value for showComments
    includeCommentsOnUpload: false, // Default value for includeCommentsOnUpload
    showAnnouncementBadge: false, // Default value for announcement badge
    // todayBasedOnTimezone: new Date(new Date().setHours(0, 0, 0, 0)),
}

const reducer = (state: FuseData, action: Action): FuseData => {
    switch (action.type) {
        case ActionType.SET_MODALSTATE:
            return { ...state, modalState: action.payload }
        case ActionType.SET_TIMESHEET_DATE:
            return { ...state, timesheetDate: action.payload }
        case ActionType.SET_TIMESHEETS:
            return { ...state, timesheets: action.payload }
        case ActionType.SET_EDITING_TIMESHEET:
            return { ...state, editingTimesheet: action.payload }
        case ActionType.SET_EDITING_BILLING_MANAGER:
            return { ...state, editingBillingManager: action.payload }
        case ActionType.SET_WORK_LOCATIONS:
            return { ...state, workLocations: action.payload }
        case ActionType.SET_WORK_LOCATION:
            return { ...state, workLocation: action.payload }
        case ActionType.SET_RUNNING_TIMESHEET:
            return { ...state, runningTimesheet: action.payload }
        case ActionType.SET_TIMESHEET_WORK_LOCATION:
            return { ...state, timesheetWorkLocation: action.payload }
        case ActionType.SET_RUNNING_TIMER_ID:
            return { ...state, runningTimerId: action.payload }
        case ActionType.SET_MISC_TIME:
            return { ...state, miscTime: action.payload }
        case ActionType.SET_TIMEZONE:
            return { ...state, timezone: action.payload }
        case ActionType.SET_SHOWCOMMENTS:
            return { ...state, showComments: action.payload }
        case ActionType.SET_INCLUDE_COMMENTS_ON_UPLOAD:
            return { ...state, includeCommentsOnUpload: action.payload }
        case ActionType.SET_SHOW_ANNOUNCEMENT_BADGE:
            return { ...state, showAnnouncementBadge: action.payload }
        case ActionType.UPDATE_TIMESHEET_ITEM:
            console.log("UPDATE_TIMESHEET_ITEM", action.payload)
            return {
                ...state,
                timesheets: state.timesheets.map((ts) =>
                    ts.id === action.payload.id
                        ? { ...ts, ...action.payload.item } // ← partial update here
                        : ts
                ),
            };
        default:
            return state
    }
}

export const GlobalContext = createContext<FuseDataContextValue>({
    ...initialState,
    setModalState: () => { },
    setTimesheetDate: () => { },
    setTimesheets: () => { },
    setEditingTimesheet: () => { },
    setEditingBillingManager: () => { },
    setWorkLocations: () => { },
    setWorkLocation: () => { },
    setTimesheetWorkLocation: () => { },
    setRunningTimesheet: () => { },
    setRunningTimerId: () => { },
    setMiscTime: () => { },
    setTimezone: () => { },
    updateTimesheetItem: () => { },
    setShowComments: () => { },
    setIncludeCommentsOnUpload: () => { },
    setShowAnnouncementBadge: () => { }, // Optional for announcement badge
})

type GlobalContextProviderProps = {
    children: ReactNode
}

const GlobalContextProvider = ({ children }: GlobalContextProviderProps) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const setModalState = (state: ModalState) => {
        dispatch({ type: ActionType.SET_MODALSTATE, payload: state })
    }

    const setTimesheetDate = (date: Date) => {
        dispatch({ type: ActionType.SET_TIMESHEET_DATE, payload: date })
    }

    const setTimesheets = (timesheets: TimesheetData[]) => {
        dispatch({ type: ActionType.SET_TIMESHEETS, payload: timesheets })
    }

    const setEditingTimesheet = (timesheet: TimesheetData | undefined) => {
        dispatch({ type: ActionType.SET_EDITING_TIMESHEET, payload: timesheet })
    }

    const setEditingBillingManager = (
        billingManager: BillingManagerModel | undefined
    ) => {
        dispatch({
            type: ActionType.SET_EDITING_BILLING_MANAGER,
            payload: billingManager,
        })
    }

    const setWorkLocations = (locations: any[]) => {
        dispatch({ type: ActionType.SET_WORK_LOCATIONS, payload: locations })
    }

    const setWorkLocation = (location: any) => {
        dispatch({ type: ActionType.SET_WORK_LOCATION, payload: location })
    }

    const setTimesheetWorkLocation = (location: any) => {
        dispatch({
            type: ActionType.SET_TIMESHEET_WORK_LOCATION,
            payload: location,
        })
    }

    const setRunningTimesheet = (timesheet: TimesheetData | undefined) => {
        dispatch({ type: ActionType.SET_RUNNING_TIMESHEET, payload: timesheet })

        // store in local storage so in case there is page reload
        if (timesheet) {
            localStorage.setItem("fuse-runningTimesheet", JSON.stringify(timesheet))
        } else {
            localStorage.removeItem("fuse-runningTimesheet")
        }
    }

    const setRunningTimerId = (id: string | null) => {
        dispatch({ type: ActionType.SET_RUNNING_TIMER_ID, payload: id })
    }

    const setMiscTime = (durationStr: number) => {
        dispatch({ type: ActionType.SET_MISC_TIME, payload: durationStr })
    }

    const setTimezone = (tz: string) => {
        dispatch({ type: ActionType.SET_TIMEZONE, payload: tz })
    }

    const setShowComments = (showComments: boolean) => {
        dispatch({ type: ActionType.SET_SHOWCOMMENTS, payload: showComments })
    }

    const setIncludeCommentsOnUpload = (include: boolean) => {
        dispatch({ type: ActionType.SET_INCLUDE_COMMENTS_ON_UPLOAD, payload: include })
    }

    const updateTimesheetItem = (payload: any) => {
        dispatch({ type: ActionType.UPDATE_TIMESHEET_ITEM, payload: payload })
    }

    const setShowAnnouncementBadge = (show: boolean) => {
        dispatch({ type: ActionType.SET_SHOW_ANNOUNCEMENT_BADGE, payload: show })
    }

    return (
        <GlobalContext.Provider
            value={{
                ...state,
                setModalState,
                setTimesheetDate,
                setTimesheets,
                setEditingTimesheet,
                setEditingBillingManager,
                setWorkLocations,
                setWorkLocation,
                setTimesheetWorkLocation,
                setRunningTimesheet,
                setRunningTimerId,
                setMiscTime,
                setTimezone,
                updateTimesheetItem,
                setShowComments,
                setIncludeCommentsOnUpload,
                setShowAnnouncementBadge, // Optional for announcement badge
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
}

export default GlobalContextProvider

export const useGlobalContext = () => {
    const context = useContext(GlobalContext)
    if (!context) {
        throw new Error(
            "useGlobalContext must be used within a GlobalContextProvider"
        )
    }
    return context
}
