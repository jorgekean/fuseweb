// /*
// THIS CONTAINS ALL OPERATION WITHIN THE CONTEXT
// */

// import { ITimesheetState, TimesheetActionType } from "./TimesheetContext";

//   // MAIN REDUCER
//   export const TimesheetReducer = (
//     state: ITimesheetState,
//     action: TimesheetActionType
//   ) => {
//     switch (action) {
//       case ProjectsActionType.ADD_ORACLE_PROJECT:
//         if (state && state.selectedProject) {
//           if (state.selectedProject.oracleProjectNumbers) {
//             state.selectedProject.oracleProjectNumbers.push(action.value);
//           } else {
//             state.selectedProject.oracleProjectNumbers = [action.value];
//           }
//         }

//         return {
//           ...state,
//         };
//       case ProjectsActionType.DELETE_ORACLE_PROJECT:
//         if (state && state.selectedProject) {
//           state.selectedProject.oracleProjectNumbers =
//             state.selectedProject.oracleProjectNumbers.filter(
//               (x) => x.projectNumber != action.value.projectNumber
//             );
//         }

//         return {
//           ...state,
//         };
//       case ProjectsActionType.GET_CLIENTS:
//         return {
//           ...state,
//           clients: action.value,
//         };
//       case ProjectsActionType.GET_PROJECTS:
//         return {
//           ...state,
//           projects: action.value,
//         };
//       case ProjectsActionType.GET_PROJECTTYPES:
//         return {
//           ...state,
//           projectTypes: action.value,
//         };
//       case ProjectsActionType.GET_PROJECTATTRIBUTES:
//         return {
//           ...state,
//           projectAttributes: action.value,
//         };
//       case ProjectsActionType.GET_PROJECTATTRIBUTES_LOOKUP:
//         return {
//           ...state,
//           projectAttributesLookUp: action.value,
//         };
//       case ProjectsActionType.GET_LOBS:
//         return {
//           ...state,
//           lobs: action.value,
//         };
//       case ProjectsActionType.GET_PRACTICES:
//         return {
//           ...state,
//           practices: action.value,
//         };
//       case ProjectsActionType.GET_TEAMS:
//         return {
//           ...state,
//           teams: action.value,
//         };
//       case ProjectsActionType.GET_ORACLE_PROJECTS:
//         return {
//           ...state,
//           oracleProjects: action.value,
//         };
//       case ProjectsActionType.GET_PROJECTS_ALLOCATIONS:
//         return {
//           ...state,
//           projectsAllocations: action.value,
//         };
//       case ProjectsActionType.SHOW_EDIT_PROJECT:
//         return {
//           ...state,
//           projectEditModalShow: action.value,
//         };
//       case ProjectsActionType.SHOW_PROJECT_ATTRIBUTE:
//         return {
//           ...state,
//           projectAttributeModalShow: action.value,
//         };
//       case ProjectsActionType.SHOW_NEW_ALLOCATION:
//         return {
//           ...state,
//           newAllocationModalShow: action.value,
//         };
//       case ProjectsActionType.SHOW_CONFIRMATION_MODAL:
//         return {
//           ...state,
//           confirmationModalShow: action.value,
//         };
//       case ProjectsActionType.SET_SELECTED_PROJECT:
//         return {
//           ...state,
//           selectedProject: action.value,
//         };
//       case ProjectsActionType.SET_CLIENTCODE:
//         return {
//           ...state,
//           clientCode: action.value,
//         };
//       case ProjectsActionType.FORM_CHANGE_EVENT:
//         return formReducer(state, action);
//       default:
//         return { ...state };
//     }
//   };

//   const formReducer = (state: IPMProjectsState, action: PMProjectsAction) => {
//     switch (action.payload.key) {
//       case "projectName":
//         if (state && state.selectedProject)
//           state.selectedProject.projectName = action.payload.newValue;
//         // state.name.error = payload.error;
//         return { ...state };
//       case "projectType":
//         if (state && state.selectedProject)
//           state.selectedProject.projectType = action.payload.newValue;
//         return { ...state };
//       case "projectStatus":
//         if (state && state.selectedProject)
//           state.selectedProject.projectStatus = action.payload.newValue;
//         return { ...state };
//       case "projectClassification":
//         if (state && state.selectedProject)
//           state.selectedProject.projectClassification = action.payload.newValue;
//         return { ...state };
//       case "impBeginDate":
//         if (state && state.selectedProject)
//           state.selectedProject.impBeginDate = action.payload.newValue;
//         return { ...state };
//       case "impEndDate":
//         if (state && state.selectedProject)
//           state.selectedProject.impEndDate = action.payload.newValue;
//         return { ...state };
//       case "ongoingSvcBeginDate":
//         if (state && state.selectedProject)
//           state.selectedProject.ongoingSvcBeginDate = action.payload.newValue;
//         return { ...state };
//       case "contractEndDate":
//         if (state && state.selectedProject)
//           state.selectedProject.contractEndDate = action.payload.newValue;
//         return { ...state };
//       case "practiceCode":
//         if (state && state.selectedProject)
//           state.selectedProject.practiceCode = action.payload.newValue;
//         return { ...state };
//       case "cdtCode":
//         if (state && state.selectedProject)
//           state.selectedProject.cdtCode = action.payload.newValue;
//         return { ...state };
//       case "teamCode":
//         if (state && state.selectedProject) {
//           state.selectedProject.teamCode = action.payload.newValue;
//           const practice = state.teams.find(t => t.teamCode === action.payload.newValue);
//           state.selectedProject.practiceCode = practice ? (`${practice?.practiceCode} - ${practice?.practiceName}` as string) : state.selectedProject.practiceCode;
//           state.selectedProject.lobCode = practice ? (`${practice?.lobCode} - ${practice?.lobName}` as string) : state.selectedProject.lobCode;
//         }
//         return { ...state };
//       case "lobCode":
//         if (state && state.selectedProject)
//           state.selectedProject.lobCode = action.payload.newValue;
//         return { ...state };
//       case "leadName":
//         if (state && state.selectedProject)
//           state.selectedProject.leadName = action.payload.newValue;
//         return { ...state };
//       case "leadContact":
//         if (state && state.selectedProject)
//           state.selectedProject.leadContact = action.payload.newValue;
//         return { ...state };
//       case "currentStatusDate":
//         if (state && state.selectedProject)
//           state.selectedProject.currentStatusDate = action.payload.newValue;
//         return { ...state };
//       case "billingSchedule":
//         if (state && state.selectedProject)
//           state.selectedProject.billingSchedule = action.payload.newValue;
//         return { ...state };
//       case "notes":
//         if (state && state.selectedProject)
//           state.selectedProject.notes = action.payload.newValue;
//         return { ...state };
//       case "oracleProjectNumber":
//         if (state && state.selectedProject)
//           state.selectedProject.oracleProjectNumber = action.payload.newValue;
//         return { ...state };
//       case "oracleProjectNumbers":
//         if (state && state.selectedProject)
//           state.selectedProject.oracleProjectNumbers = action.payload.newValue;
//         return { ...state };
//       default:
//         throw new Error(`No reducer available for key = ${action.payload.key}`);
//     }
//   };
