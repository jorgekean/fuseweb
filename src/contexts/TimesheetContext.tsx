// import React, { createContext, useReducer, useState } from "react"
// import TimesheetData from "../models/timesheet"

// export interface ITimesheetState {
//   timesheets: TimesheetData[]
// }

// export enum TimesheetActionType {

//   GET_TIMESHEETS = "GET_TIMESHEETS"
// }

// const TimesheetContext = createContext<{
//   state: undefined | ITimesheetState
//   dispatch: React.Dispatch<any>
// }>({ state: undefined, dispatch: () => null })

// const Provider = TimesheetContext.Provider;

// export interface ITimesheetProviderProps {
//   children: React.ReactNode
// }

// // PROVIDER
// export const TimesheetProvider = ({ children }: ITimesheetProviderProps) => {

//   const initialState: ITimesheetState = {
//     timesheets: [],
//   };

//   const [state, dispatch] = useReducer(TimesheetReducer, initialState);

//   return <Provider value={{ state, dispatch }}>{children}</Provider>;
// };

// export function usePMProjectsContext() {
//   const context = React.useContext(TimesheetContext);

//   if (context === undefined) {
//     // handle
//     throw new Error(
//       "useTimesheetContext should be used within an TimesheetProvider."
//     );
//   }
//   return context;
// }
