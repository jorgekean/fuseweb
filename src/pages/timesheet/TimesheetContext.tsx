import React, { createContext, useContext, useReducer, ReactNode } from "react"
import { TimesheetData } from "../../models/Timesheet"


// Define action types
enum ActionType {
    // SET_BILLINGS = "SET_BILLINGS",
    SET_SHOWSELECTOPTIONS = "SET_SHOWSELECTOPTIONS",
    SET_SELECTEDITEMS = "SET_SELECTEDITEMS",
    SET_COPIEDROWS = "SET_COPIEDROWS",
    SET_SORT_CONFIG = "SET_SORT_CONFIG",
}


// State interface with action type union
interface TimesheetContextData {
    selectedRows: TimesheetData[]
    showSelectOptions: boolean
    copiedRows: TimesheetData[]
    sortConfig: {
        key: string
        direction: "asc" | "desc"
    }
}


interface TimesheetContextValue extends TimesheetContextData {
    setSelectedRows: (selectedRows: TimesheetData[]) => void
    setShowSelectOptions: (showSelectOptions: boolean) => void
    setCopiedRows: (selectedRows: TimesheetData[]) => void
    setSortConfig: (key: string, direction: "asc" | "desc") => void
}

interface Action {
    type: ActionType
    payload?: any
}

const initialState: TimesheetContextData = {
    selectedRows: [],
    showSelectOptions: true,
    copiedRows: [],
    sortConfig: {
        key: "createdDate", // Default sorting key
        direction: "desc", // Default sorting direction
    }
}

const reducer = (state: TimesheetContextData, action: Action): TimesheetContextData => {
    switch (action.type) {
        case ActionType.SET_SELECTEDITEMS:
            return { ...state, selectedRows: action.payload }
        case ActionType.SET_SHOWSELECTOPTIONS:
            return { ...state, showSelectOptions: action.payload }
        case ActionType.SET_COPIEDROWS:
            return { ...state, copiedRows: action.payload }
        case ActionType.SET_SORT_CONFIG:
            return { ...state, sortConfig: action.payload }
        default:
            return state
    }
}

export const TimesheetContext = createContext<TimesheetContextValue>({
    ...initialState,

    setSelectedRows: () => { },
    setShowSelectOptions: () => { },
    setCopiedRows: () => { },
    setSortConfig: () => { },
})

type TimesheetContextProviderProps = {
    children: ReactNode
}

const TimesheetContextProvider = ({ children }: TimesheetContextProviderProps) => {
    const [state, dispatch] = useReducer(reducer, initialState)


    const setShowSelectOptions = (showSelectOpt: boolean) => {
        dispatch({ type: ActionType.SET_SHOWSELECTOPTIONS, payload: showSelectOpt })
    }

    const setSelectedRows = (selectedRows: TimesheetData[]) => {
        dispatch({ type: ActionType.SET_SELECTEDITEMS, payload: selectedRows })
    }

    const setCopiedRows = (selectedRows: TimesheetData[]) => {
        dispatch({ type: ActionType.SET_COPIEDROWS, payload: selectedRows })
    }

    const setSortConfig = (key: string, direction: "asc" | "desc") => {
        dispatch({ type: ActionType.SET_SORT_CONFIG, payload: { key, direction } })
    }

    return (
        <TimesheetContext.Provider
            value={{
                ...state,
                setSelectedRows,
                setShowSelectOptions,
                setCopiedRows,
                setSortConfig
            }}
        >
            {children}
        </TimesheetContext.Provider>
    )
}

export default TimesheetContextProvider

export const useTimesheetContext = () => {
    const context = useContext(TimesheetContext)
    if (!context) {
        throw new Error(
            "useTimesheetContext must be used within a TimesheetContextProvider"
        )
    }
    return context
}
