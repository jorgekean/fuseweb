import React, { useRef } from "react";
import { FaCheck, FaFileImport, FaFileExport, FaTrash, FaTimes, FaArchive, FaTrophy } from "react-icons/fa";
import { useBillingManagerContext } from "./BillingManagerContext";
import toast from "react-hot-toast";
import { BillingManagerService } from "./BillingManagerService";
import DexieUtils from "../../utils/dexie-utils";
import { BillingManagerModel } from "../../models/BillingManager";
import { ErrorModel } from "../../models/ErrorModel";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import FuseTooltip from "../../components/shared/FuseTooltip";
import { useGlobalContext } from "../../context/GlobalContext";
import { Page, Text, View, Document, StyleSheet, pdf  as pdfGen } from '@react-pdf/renderer';
import { TimesheetService } from "../timesheet/TimesheetService";
import { SettingModel } from "../../models/SettingModel";
import { SettingsService } from "../settings/SettingsService";
import { useMsal } from "@azure/msal-react";
import { YearlyHoliday } from "../../utils/constants";

const BillingManagerMoreActions = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const billingManagerService = BillingManagerService();
    const timesheetService = TimesheetService();
    const settingsService = SettingsService();
    const { accounts, instance } = useMsal();

    const db = DexieUtils<BillingManagerModel>({ tableName: "billingManager" });
    const errorDB = DexieUtils<ErrorModel>({ tableName: "fuse-logs" });

    const {
        selectedRows,
        setSelectedRows,
        setShowSelectOptions,
        showSelectOptions,
        setSelectAllChecked,
        showArchived,
        searchTerm,
    } = useBillingManagerContext();

    const {
        timesheetDate
      } = useGlobalContext();

    const { modalState, setModalState } = useGlobalContext();

    const handleError = (error: any, message: string) => {
        toast.error(message, { position: "top-right" });
        errorDB.add({
            message: error.message,
            stack: error.stack || String(error),
            timestamp: new Date(),
        });
    };

    const handleSelect = () => {
        setShowSelectOptions(!showSelectOptions);
    };

    const handleDeleteSelected = async () => {
        setModalState({
            title: "Delete",
            showModal: true,
            body: <div>Are you sure you want to delete these items?</div>,
            footer: (
                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={() => {
                            setModalState({ ...modalState, showModal: false })
                        }}
                        className="bg-gray-600 text-white rounded-md px-4 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        No
                    </button>
                    <button
                        onClick={async () => {
                            selectedRows.forEach(async (ts) => {
                                await db.deleteEntity(ts.id!);
                            });
                            await billingManagerService.getBillingData(searchTerm, showArchived);
                            toast.success("Billings deleted successfully", { position: "top-right" });
                            setShowSelectOptions(true);
                            setSelectedRows([]);

                            setModalState({ ...modalState, showModal: false })
                        }}
                        className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Yes
                    </button>
                </div>
            ),
        })
    };

    const handleArchiveSelected = async () => {
        selectedRows.forEach(async (ts) => {
            ts.isArchived = !ts.isArchived;
            await db.update(ts);
        });
        await billingManagerService.getBillingData(searchTerm, showArchived);
        toast.success("Billings archived successfully", { position: "top-right" });
        setShowSelectOptions(true);
        setSelectedRows([]);
    };

    const handleImport = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (file) {
                const readFile = await billingManagerService.readFile(file);
                // setImporting(!importing);
                // Delay the execution of getBillingData by 2 seconds
                setTimeout(async () => {
                    if (readFile.errors.length > 0) {
                        // concat errors client field to make a comma delimeted string
                        const errorClients = readFile.errors
                            .map((e: any) => e.client)
                            .filter((v: any, i: any, a: any) => a.indexOf(v) === i)
                            .join(', ');


                        toast.custom((t) => (
                            <div
                                className={`position-top-right bg-red-100 text-red-800 border border-red-400 px-4 py-3 rounded shadow-md max-w-sm w-full ${t.visible ? 'animate-enter' : 'animate-leave'
                                    }`}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <strong className="font-bold">Import Error:</strong>
                                        <div className="text-sm">
                                            {errorClients} exist(s) multiple times. Please check the details.
                                        </div>
                                    </div>
                                    <button onClick={() => toast.dismiss(t.id)} className="ml-2 text-lg font-bold">
                                        ✖
                                    </button>
                                </div>
                            </div>
                        ), {
                            duration: 10000, // 10 seconds or set to Infinity for manual close only
                        });
                    }
                    else {
                        // loop thorugh readFile.data and add to db
                        await db.bulkAdd(readFile.data);
                        toast.success(`Imported file: ${file.name}`, { position: "top-right" });
                    }

                    await billingManagerService.getBillingData(searchTerm, showArchived);
                }, 2000);
            }
        } catch (error) {
            handleError(error, "Error importing file!");
        }

        // 👇 Reset the input so it can trigger again even for the same file
        event.target.value = '';
    };

    const handleExport = async () => {
        try {
            const rawData = await db.getAll();
            if (rawData.length === 0) {
                toast.error("No data available to export.");
                return;
            }

            // export only Client, ProjectCode, TaskCode, IsArchived and orderBy client, isArchived, billingType
            const filteredData = rawData.map(({ client, projectCode, taskCode, isArchived, billingType }) => ({
                client,
                projectCode,
                taskCode,
                isArchived,
                billingType
            })).sort((a, b) => {
                const clientComparison = a.client.localeCompare(b.client);
                if (clientComparison !== 0) return clientComparison;
                return a.isArchived === b.isArchived ? 0 : a.isArchived ? 1 : -1;
            }
            );

            const processedData = filteredData.map(({ ...rest }) => {
                const capitalizedData: { [key: string]: any } = {};
                for (const key in rest) {
                    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                    capitalizedData[capitalizedKey] = rest[key as keyof typeof rest];
                }
                return capitalizedData;
            });

            const worksheet = XLSX.utils.json_to_sheet(processedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Billing Data");

            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

            saveAs(blob, "FUSE_BillingData.xlsx");
            toast.success("Data exported successfully as Excel!");
        } catch (error) {
            handleError(error, "Failed to export data.");
        }
    };

    
const styles = StyleSheet.create({
    page: { padding: 24, fontFamily: 'Helvetica' },
    title: { textAlign: 'center', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { textAlign: 'center', fontSize: 18, marginBottom: 16 },
    table: { display: 'flex', flexDirection: 'column', width: '100%', marginBottom: 16 },
    tableRow: { flexDirection: 'row' },
    tableHeader: { backgroundColor: '#7030A0', color: 'white', fontWeight: 'bold' },
    tableCell: { border: '1pt solid black', padding: 6, fontSize: 10, textAlign: 'center', flex: 1 },
    red: { backgroundColor: '#F79797', fontWeight: 'bold' },
    note: { fontSize: 10, marginTop: 12 }
  });
  
  const GenerateBillableAchievementReportData =  async  () => {

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const currentTimesheetThisYear =
    await timesheetService.getTimesheetsRangeofDate(startOfYear, timesheetDate);

    const billableTimesheets = await 
    billingManagerService.filterBillableTimesheets(currentTimesheetThisYear);
        
    const startOfMonth = new Date(timesheetDate.getFullYear(), timesheetDate.getMonth(), 1);
    const endOfMonth = new Date(timesheetDate.getFullYear(), timesheetDate.getMonth() + 1, 0);
    const endOfYear = new Date(timesheetDate.getFullYear(), 12, 31);
    const monthlyTimesheets = billableTimesheets.filter(ts => {
        const tsDate = new Date(ts.timesheetDate);
        return tsDate >= startOfMonth && tsDate <= endOfMonth;
      });
    settingsService.getSettingByType("billableGoal").then((settings) => {
        console.log("Settings:", settings);
        const billableGoal = settings?.value || 1500; // Default to 1500 if not set
        const monthlyBillableGoal = billableGoal/12 || 125; // Default to 125 if not set
        const monthlyActual = timesheetService.convertBillingHours(monthlyTimesheets.reduce((acc, ts) => acc + (ts.duration || 0), 0));
        const monthlyPercent = ((monthlyActual / billableGoal) * 100).toFixed(2) + '%';
        const ytdActual = timesheetService.convertBillingHours(billableTimesheets.reduce((acc, ts) => acc + (ts.duration || 0), 0));
        const ytdGoal = monthlyBillableGoal * timesheetDate.getMonth() || 0; // Default to 0 if not set
        const ytdPercent = ((ytdActual / ytdGoal) * 100).toFixed(2) + '%';
        const annualGoal = billableGoal; // Use the same goal for simplicity
        const remainingDays = getRemainingWorkDays(timesheetDate, endOfYear);
        const dailyTarget = ((billableGoal-ytdActual) / remainingDays).toFixed(2);

        GenerateBillableAchievementReport({
            monthyear: new Date().getFullYear(),
            name: accounts[0].name || 'GD Libanan',
            billableData: {
                monthlyGoal: billableGoal.toString(),
                monthlyActual: monthlyActual.toString(),
                monthlyPercent: monthlyPercent,
                ytdGoal: ytdGoal.toString(),
                ytdActual: ytdActual.toString(),
                ytdPercent: ytdPercent,
                annualGoal: annualGoal.toString(),
                remainingDays: remainingDays.toString(),
                dailyTarget: dailyTarget
            }
        });
  });

  };

function getRemainingWorkDays(from: Date, to: Date): number {
  // Clone dates to avoid mutation
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());

  // Calculate total days between the two dates
  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Calculate weekdays
  let remaining = 0;
  for (let i = 0; i < totalDays; i++) {
    const currentDay = new Date(start);
    currentDay.setDate(start.getDate() + i);
    const dayOfWeek = currentDay.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sundays (0) and Saturdays (6)
      remaining++;
    }
  }

  // Subtract holidays that are not in the past and fall on a weekday
  const holidaysToSubtract = YearlyHoliday.filter(h => {
    return (
      h.Date > start &&
      h.Date <= end &&
      h.Date.getDay() !== 0 &&
      h.Date.getDay() !== 6
    );
  }).length;

  console.log("Remaining Work Days:", remaining, "Holidays to Subtract:", holidaysToSubtract);
  return remaining - holidaysToSubtract;
}
  
//   // Helper for PTO records (stub, adjust as needed)
//   function getDaysFromPTORecord(day: string, noOfDays: number, from: Date): number {
//     // You can implement your PTO logic here, for now just return noOfDays
//     return noOfDays;
//   }
  

  const GenerateBillableAchievementReport = async ({
    monthyear=2025,
    name='Gab Libanan',
    billableData = { monthlyGoal: '0', monthlyActual: '0', monthlyPercent: '0%', ytdGoal: '0', ytdActual: '0', 
        ytdPercent: '0%', annualGoal: '0', remainingDays: '0', dailyTarget: '0'}
    
  }) => {


    const todaysTimesheets =
    await timesheetService.getTimesheetsOfTheDay();
    console.log("Today's Timesheets:", todaysTimesheets);

    const doc = (
      <Document>
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.title}>Billable Achievement Report as of {monthyear}</Text>
          <Text style={styles.subtitle}>{name}</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Monthly Billable Goal</Text>
              <Text style={styles.tableCell}>Monthly Actual</Text>
              <Text style={styles.tableCell}>Monthly Billable %</Text>
              <Text style={styles.tableCell}>YTD Billable Goal</Text>
              <Text style={styles.tableCell}>YTD Actual</Text>
              <Text style={styles.tableCell}>YTD Billable %</Text>
              <Text style={styles.tableCell}>Annual Billable Goal</Text>
              <Text style={styles.tableCell}>Remaining Work Days</Text>
              <Text style={styles.tableCell}>Daily Billable Target hours to meet goal</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{billableData.monthlyGoal}</Text>
              <Text style={styles.tableCell}>{billableData.monthlyActual}</Text>
              <Text style={[styles.tableCell, styles.red]}>{billableData.monthlyPercent}</Text>
              <Text style={styles.tableCell}>{billableData.ytdGoal}</Text>
              <Text style={styles.tableCell}>{billableData.ytdActual}</Text>
              <Text style={[styles.tableCell, styles.red]}>{billableData.ytdPercent}</Text>
              <Text style={styles.tableCell}>{billableData.annualGoal}</Text>
              <Text style={styles.tableCell}>{billableData.remainingDays}</Text>
              <Text style={[styles.tableCell, styles.red]}>{billableData.dailyTarget}</Text>
            </View>
          </View>
          <Text style={styles.note}>
            *Remaining work days does not include PTOs/OOOs and future Holidays taken by the colleague unless entered as OOO days in the setting windows.
          </Text>
          <Text style={styles.note}>*YTD = Year to Date</Text>
        </Page>
      </Document>
    );
  
    const blob = await pdfGen(doc).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };
    return (
        <div className="flex items-center justify-between mt-2">
            {/* Hidden file input for import */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv,.xlsx,.xls"
            />

            <div className="flex space-x-4 bg-gray-100 rounded-md px-2 py-1 shadow-sm">
                <FuseTooltip content={showSelectOptions ? "Hide Items Selection" : "Select Items"}>
                    <div
                        className={`w-8 h-8 flex items-center justify-center ${showSelectOptions ? "bg-green-200" : "bg-green-100"
                            } hover:bg-green-200 rounded-full cursor-pointer transition-all`}
                        onClick={handleSelect}
                    // title={showSelectOptions ? "Hide Items Selection" : "Select Items"}
                    >
                        {showSelectOptions ? <FaTimes className="text-green-600" /> : <FaCheck className="text-green-600" />}
                    </div>
                </FuseTooltip>
                <FuseTooltip content="Import">
                    <div
                        className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-full cursor-pointer transition-all"
                        onClick={handleImport}
                    // title="Import"
                    >
                        <FaFileImport className="text-blue-600" />
                    </div>
                </FuseTooltip>

                <FuseTooltip content="Export">
                    <div
                        className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 rounded-full cursor-pointer transition-all"
                        onClick={handleExport}
                    // title="Export"
                    >
                        <FaFileExport className="text-purple-600" />
                    </div>
                </FuseTooltip>
                
                <FuseTooltip content="Billable Achievement Goal">
                    <div
                        className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 rounded-full cursor-pointer transition-all"
                        onClick={GenerateBillableAchievementReportData}
                     title="Export"
                    >
                        <FaTrophy className="text-yellow-600" />
                    </div>
                </FuseTooltip>
                {/* <button
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer transition-all"
                    onClick={() => GenerateBillableAchivementReport}
                ></button> */}

                {showSelectOptions && (<>
                
                    <FuseTooltip content="Delete Selected">
                        <div
                            className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded-full cursor-pointer transition-all"
                            onClick={
                                selectedRows.length === 0
                                ? () => {
                                        toast.error("No data is selected.", {
                                            position: "top-right",
                                        });
                                    }
                                : () => {
                                        handleDeleteSelected();
                                    }
                            }
                        >
                            <FaTrash className="text-red-600" />
                        </div>
                    </FuseTooltip>

                    <FuseTooltip content="Archive Selected">
                        <div
                            className="w-8 h-8 flex items-center justify-center bg-yellow-100 hover:bg-yellow-200 rounded-full cursor-pointer transition-all"
                            onClick={handleArchiveSelected}
                        >
                            <FaArchive className="text-yellow-600" />
                        </div>
                    </FuseTooltip>

                </>)}

                {selectedRows.length > 0 && (
                <>
                    <FuseTooltip content="Cancel">
                        <div
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer transition-all"
                            onClick={() => {
                                setSelectedRows([]);
                                setSelectAllChecked(false);
                            }}
                        // title="Cancel"
                        >
                            <FaTimes className="text-gray-600" />
                        </div>
                    </FuseTooltip>
                    </>
                )}
            </div>
        </div>
    );
};

export default BillingManagerMoreActions;



