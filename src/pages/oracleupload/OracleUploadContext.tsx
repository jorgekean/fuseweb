import { createContext, useContext, useReducer, ReactNode } from "react"

export interface Week {
    label: string
    value: string
}

export interface OracleUploadTask {
    id: string;
    client: string;
    taskDescription: string;
    projectCode: string;
    taskCode: string;
    workLoc: string;
    sunHours: number | "";
    monHours: number | "";
    tueHours: number | "";
    wedHours: number | "";
    thuHours: number | "";
    friHours: number | "";
    satHours: number | "";
}

// Define action types
enum ActionType {
    SET_TOUPLOAD = "SET_TOUPLOAD",
    SET_SELECTEDWEEK = "SET_SELECTEDWEEK",
    SET_SELECTEDDAYS = "SET_SELECTEDDAYS",
    SET_TOTAL = "SET_TOTAL",
}

export interface OracleTotal {
    client: string,
    taskDescription: string,
    workLoc: { description: string },
    projectCode: string,
    taskCode: string,
    sunHours: number,
    monHours: number,
    tueHours: number,
    wedHours: number,
    thuHours: number,
    friHours: number,
    satHours: number,
    grandTotal: number, // Grand total initialization
}

// State interface with action type union
interface OracleUploadData {
    toUpload: OracleUploadTask[],
    selectedDays: string[],
    selectedWeek: Week | null,
    total: OracleTotal | null
}

interface OracleUploadContextValue extends OracleUploadData {
    setToUpload: (billings: OracleUploadTask[]) => void
    setSelectedDays: (days: string[]) => void
    setSelectedWeek: (week: Week | null) => void
    setTotal: (total: OracleTotal) => void
}

interface Action {
    type: ActionType
    payload?: any
}

const initialState: OracleUploadData = {
    toUpload: [],
    selectedDays: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ],
    selectedWeek: null,
    total: null
}

const reducer = (state: OracleUploadData, action: Action): OracleUploadData => {
    switch (action.type) {
        case ActionType.SET_TOUPLOAD:
            return { ...state, toUpload: action.payload }
        case ActionType.SET_SELECTEDDAYS:
            return { ...state, selectedDays: action.payload }
        case ActionType.SET_SELECTEDWEEK:
            return { ...state, selectedWeek: action.payload }
        case ActionType.SET_TOTAL:
            return { ...state, total: action.payload }
        // Add more cases as needed
        default:
            return state
    }
}

export const OracleUploadContext = createContext<OracleUploadContextValue>({
    ...initialState,

    setToUpload: () => { },
    setSelectedDays: () => { },
    setSelectedWeek: () => { },
    setTotal: () => { },
})

type OracleUploadContextProviderProps = {
    children: ReactNode
}

const OracleUploadContextProvider = ({ children }: OracleUploadContextProviderProps) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const setToUpload = (toUpload: any[]) => {
        dispatch({ type: ActionType.SET_TOUPLOAD, payload: toUpload })
    }

    const setSelectedDays = (days: string[]) => {
        dispatch({ type: ActionType.SET_SELECTEDDAYS, payload: days })
    }

    const setSelectedWeek = (week: Week | null) => {
        dispatch({ type: ActionType.SET_SELECTEDWEEK, payload: week })
    }

    const setTotal = (total: OracleTotal) => {
        dispatch({ type: ActionType.SET_TOTAL, payload: total })
    }

    return (
        <OracleUploadContext.Provider
            value={{
                ...state,
                setToUpload,
                setSelectedDays,
                setSelectedWeek,
                setTotal
            }}
        >
            {children}
        </OracleUploadContext.Provider>
    )
}

export default OracleUploadContextProvider

export const useOracleUploadContext = () => {
    const context = useContext(OracleUploadContext)
    if (!context) {
        throw new Error(
            "useOracleUploadContext must be used within a OracleUploadContextProvider"
        )
    }
    return context
}
