import React, { createContext, useContext, useReducer, ReactNode } from "react"
import { BillingManagerModel } from "../../models/BillingManager"


// Define action types
enum ActionType {
    SET_BILLINGS = "SET_BILLINGS",
    SET_SHOWARCHIVED = "SET_SHOWARCHIVED",
    SET_SEARCHTERM = "SET_SEARCHTERM",

    SET_SHOWSELECTOPTIONS = "SET_SHOWSELECTOPTIONS",
    SET_SELECTEDITEMS = "SET_SELECTEDITEMS",
    SET_SELECTALLCHECKED = "SET_SELECTALLCHECKED",
    UPDATE_BILLINGDATA = "UPDATE_BILLINGDATA",
}

export type BillingType = "Billable" | "NonBillable";

export const BillingTypeOptions = [
    { label: "Billable", value: "Billable" },
    { label: "NonBillable", value: "NonBillable" },
];


// State interface with action type union
interface BillingManagerData {
    billings: BillingManagerModel[],
    showArchived: boolean,
    searchTerm: string;
    selectedBillingType: BillingType | null;

    selectedRows: BillingManagerModel[]
    showSelectOptions: boolean
    selectAllChecked: boolean
}


interface BillingManagerContextValue extends BillingManagerData {
    setBillings: (billings: BillingManagerModel[]) => void
    setShowArchived: (showArchived: boolean) => void
    setSearchTerm: (q: string) => void
    setSelectedRows: (selectedRows: BillingManagerModel[]) => void
    setShowSelectOptions: (showSelectOptions: boolean) => void
    setSelectAllChecked: (selectAll: boolean) => void

    updateBillingData: (payload: any) => void
}

interface Action {
    type: ActionType
    payload?: any
}

const initialState: BillingManagerData = {
    billings: [],
    showArchived: false,
    searchTerm: "",
    selectedBillingType: null,

    selectedRows: [],
    showSelectOptions: true,
    selectAllChecked: false
}

const reducer = (state: BillingManagerData, action: Action): BillingManagerData => {
    switch (action.type) {
        case ActionType.SET_BILLINGS:
            return { ...state, billings: action.payload }
        case ActionType.SET_SHOWARCHIVED:
            return { ...state, showArchived: action.payload }
        case ActionType.SET_SEARCHTERM:
            return { ...state, searchTerm: action.payload }

        case ActionType.SET_SELECTEDITEMS:
            return { ...state, selectedRows: action.payload }
        case ActionType.SET_SHOWSELECTOPTIONS:
            return { ...state, showSelectOptions: action.payload }
        case ActionType.SET_SELECTALLCHECKED:
            return { ...state, selectAllChecked: action.payload }

        case ActionType.UPDATE_BILLINGDATA:
            console.log("UPDATE_TIMESHEET_ITEM", action.payload)
            return {
                ...state,
                billings: state.billings.map((ts) =>
                    ts.id === action.payload.id
                        ? { ...ts, ...action.payload.item } // ← partial update here
                        : ts
                ),
            };
        default:
            return state
    }
}

export const BillingManagerContext = createContext<BillingManagerContextValue>({
    ...initialState,

    setBillings: () => { },
    setShowArchived: () => { },
    setSearchTerm: () => { },
    setSelectedRows: () => { },
    setShowSelectOptions: () => { },
    setSelectAllChecked: () => { },

    updateBillingData: () => { },
});

type BillingManagerContextProviderProps = {
    children: ReactNode
}

const BillingManagerContextProvider = ({ children }: BillingManagerContextProviderProps) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const setBillings = (billings: any[]) => {
        dispatch({ type: ActionType.SET_BILLINGS, payload: billings })
    }

    const setShowArchived = (showArchived: boolean) => {
        dispatch({ type: ActionType.SET_SHOWARCHIVED, payload: showArchived })
    }

    const setSearchTerm = (q: string) => {
        dispatch({ type: ActionType.SET_SEARCHTERM, payload: q })
    }

    const setShowSelectOptions = (showSelectOpt: boolean) => {
        dispatch({ type: ActionType.SET_SHOWSELECTOPTIONS, payload: showSelectOpt })
    }

    const setSelectedRows = (selectedRows: BillingManagerModel[]) => {
        dispatch({ type: ActionType.SET_SELECTEDITEMS, payload: selectedRows })
    }

    const setSelectAllChecked = (selectAll: boolean) => {
        dispatch({ type: ActionType.SET_SELECTALLCHECKED, payload: selectAll })
    }

    const updateBillingData = (payload: any) => {
        dispatch({ type: ActionType.UPDATE_BILLINGDATA, payload: payload })
    }


    return (
        <BillingManagerContext.Provider
            value={{
                ...state,
                setBillings,
                setShowArchived,
                setSearchTerm,
                setSelectedRows,
                setShowSelectOptions,
                setSelectAllChecked,

                updateBillingData
            }}
        >
            {children}
        </BillingManagerContext.Provider>
    )
}

export default BillingManagerContextProvider

export const useBillingManagerContext = () => {
    const context = useContext(BillingManagerContext)
    if (!context) {
        throw new Error(
            "useBillingManagerContext must be used within a BillingManagerContextProvider"
        )
    }
    return context
}
