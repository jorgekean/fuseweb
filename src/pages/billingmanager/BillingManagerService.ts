

import DexieUtils from "../../utils/dexie-utils"
import { BillingManagerModel } from "../../models/BillingManager";
import { useBillingManagerContext } from "./BillingManagerContext";
import { read, utils, WorkBook, WorkSheet } from "xlsx";
import { error } from "console";
import { TimesheetData } from "../../models/Timesheet";

export const BillingManagerService = () => {
  const {
    setBillings
  } = useBillingManagerContext()

  const db = DexieUtils<BillingManagerModel>({
    tableName: "billingManager",
  })

  const refreshBillingsState = async (showArchived: boolean) => {
    let billingsFromDB = (await db.getAll())
    if (!showArchived) {
      billingsFromDB = billingsFromDB.filter(f => !f.isArchived)
    }

    setBillings(billingsFromDB)
  }

  const getBillingData = async (searchTerm: string, showArchived: boolean) => {
    try {
      await db.getAll()
        .then((data) => {
          // Filter out archived records if showArchived is false
          let filteredData = showArchived
            ? data
            : data.filter((item) => !item.isArchived)

          if (searchTerm) {

            filteredData = filteredData.filter(
              (item) =>
                item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.projectCode
                  .toLowerCase()?.includes(searchTerm.toLowerCase()) ||
                item.taskCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.billingType?.toLowerCase().includes(searchTerm.toLowerCase())
            )

          }

          // Sort the data by the client field
          filteredData.sort((a, b) => a.client.localeCompare(b.client))

          // Set the sorted and filtered data to BillingManagerModel
          setBillings(filteredData)
        })
        .catch((error: any) => {
          //   handleError(error, "Error fetching billing data!")
        })
    } catch (error: any) {
      //   handleError(error, "Error fetching billing data!")
    }
  }
  const filterBillableTimesheets = async (timesheets: TimesheetData[]): Promise<TimesheetData[]> => {
    // Step 1: Get all unique projectCode/taskCode pairs from timesheets
    const codePairs = Array.from(
      new Set(
        timesheets
          .filter(ts => ts.client)
          .map(ts => `${ts.client!.projectCode}|${ts.client!.taskCode}`)
      )
    );
  
    // Step 2: Query billing managers for those pairs and Billable type
    const billableManagers = await db.getAll()
      .then(billingManagers => billingManagers.filter(bm => bm.billingType === "Billable"))
      .then(billingManagers => billingManagers.filter(bm => 
        bm.billingType === "Billable" &&
        codePairs.includes(`${bm.projectCode}|${bm.taskCode}`)
      ));
  
    // Step 3: Filter timesheets to those matching billable managers
    return timesheets.filter(ts =>
      ts.client &&
      billableManagers.some(bm =>
        bm.projectCode === ts.client!.projectCode &&
        bm.taskCode === ts.client!.taskCode
      )
    );
  };

  const readFile = (file: File) => {
    let errorClient: any = []
    let newlyImportedData: BillingManagerModel[] = []

    const reader = new FileReader()
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook: WorkBook = read(data, { type: "array" })
      const worksheet: WorkSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData: any[][] = utils.sheet_to_json(worksheet, {
        header: 1,
      }) as any[][]

      const existingBillingData = await db.getAll()
      //  let newlyImportedData: BillingManagerModel[] = []

      const fromNewImport = jsonData[0]?.[3]?.toLowerCase() === "isarchived"
      // loop through jsonData but exclude the first row
      for (let i = 1; i < jsonData.length; i++) {
        let newBilling: BillingManagerModel = {} as BillingManagerModel
        console.log(jsonData[i][3])
        if (fromNewImport) {// for new import format based on new export format
          newBilling = {
            client: jsonData[i][0],
            projectCode: jsonData[i][1],
            taskCode: jsonData[i][2],
            isArchived: (function () {
              const value = jsonData[i][3];

              // 1. Check if it's already a boolean
              if (typeof value === 'boolean') {
                return value;
              }

              // 2. If it's a string, parse 'true'/'false' (case-insensitive)
              if (typeof value === 'string') {
                return value.toLowerCase() === 'true';
              }

              // 3. For any other type (number, null, undefined, etc.),
              //    return false, or handle as per your specific requirements.
              //    Using Boolean(value) would convert 0 to false, non-zero to true,
              //    empty string to false, etc. But if you strictly want "true" or "false" string,
              //    then returning false for other types is safer.
              return false; // Default for non-boolean, non-"true"/"false" strings
            })(),
            billingType: jsonData[i][4]
          }
        } else {// for data migration from old Fuse app
          newBilling = {
            client: jsonData[i][0],
            projectCode: jsonData[i][1],
            taskCode: jsonData[i][2],
            billingType: jsonData[i][3],
            isArchived: jsonData[i][4]?.toLowerCase() !== "active",
          }
        }


        // Check if client name already exists
        const clientExists = existingBillingData.some(
          (billing) => billing.client === newBilling.client
        )

        // Check if client name already exists and other fields are different in newly imported data
        const clientExistsOnSameImportFile = existingBillingData.some(s =>
          s.client === newBilling.client &&
          (s.projectCode !== newBilling.projectCode 
            || s.taskCode !== newBilling.taskCode 
            || s.isArchived !== newBilling.isArchived
            || s.billingType !== newBilling.billingType)
        )

        if (!clientExists && !clientExistsOnSameImportFile) {// && !clientExistsOnSameImportFile) {
          // const id = await db.add(newBilling)
          newlyImportedData.push({ ...newBilling }) // Add the new billing to the newly imported data array
          existingBillingData.push({ ...newBilling }) // Add the new billing to the existing data     
        }

        if (clientExistsOnSameImportFile) {
          errorClient.push(newBilling)
        }
      }
    }
    reader.readAsArrayBuffer(file)

    return { data: newlyImportedData, errors: errorClient };
  }

  return {
    refreshBillingsState: refreshBillingsState,
    getBillingData: getBillingData,
    readFile: readFile,
    filterBillableTimesheets: filterBillableTimesheets
  }
}
