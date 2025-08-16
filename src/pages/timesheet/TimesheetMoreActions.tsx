import React, { useEffect, useState } from 'react';
import { FaCheck, FaCopy, FaPaste, FaTimes, FaTrash, FaTrashAlt } from 'react-icons/fa';
import { useGlobalContext } from '../../context/GlobalContext';
import toast from 'react-hot-toast';
import DexieUtils from '../../utils/dexie-utils';
import { TimesheetData } from '../../models/Timesheet';
import { ErrorModel } from '../../models/ErrorModel';
import { useTimesheetContext } from './TimesheetContext';
import { TimesheetService } from './TimesheetService';
import FuseTooltip from '../../components/shared/FuseTooltip';
import { Edit } from 'react-feather';
import EditableStartTime from './EditableStartTime';
import { MiscTimeData } from '../../models/MiscTime';

const TimesheetMoreActions = () => {
    const [totalHours, setTotalHours] = useState(0);
    const [startTime, setStartime] = useState<Date | undefined>(undefined);

    const { timesheets, modalState, timesheetDate, miscTime, setTimesheets, setModalState } = useGlobalContext();
    const { showSelectOptions, selectedRows, copiedRows, setShowSelectOptions, setCopiedRows, setSelectedRows } = useTimesheetContext();

    const db = DexieUtils<TimesheetData>({
        tableName: "timesheet",
    });
    const errorDB = DexieUtils<ErrorModel>({
        tableName: "fuse-logs",
    });
    const miscDB = DexieUtils<MiscTimeData>({
        tableName: "miscTime",
    });

    const timesheetService = TimesheetService();

    useEffect(() => {
        // put slight delay to allow the timesheetDate to be set       
        const timer = setTimeout(async () => {
            // if current day is today, ensure theat misc time is created            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isToday = timesheetDate?.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)
            if (isToday) {
                const allTimers = await miscDB.getAll()
                const miscTimer = allTimers.find(
                    (f) =>
                        f.timesheetDate.setHours(0, 0, 0, 0) ===
                        today.setHours(0, 0, 0, 0)
                )
                if (!miscTimer) {
                    const newMiscTime: MiscTimeData = {
                        startTime: new Date(),
                        duration: 0,
                        timesheetDate: today,
                        running: false,
                    };
                    await miscDB.add(newMiscTime);
                }
            }

            const allTimers = await miscDB.getAll()
            const miscTimer = allTimers.find(
                (f) =>
                    f.timesheetDate.setHours(0, 0, 0, 0) ===
                    timesheetDate.setHours(0, 0, 0, 0)
            )
            if (miscTimer) {
                setStartime(miscTimer.startTime)
            } else {
                setStartime(undefined)
            }


        }, 200);

        return () => clearTimeout(timer);
        // fetchStartTime()
    }, [timesheetDate])

    // initial load, set total hours
    useEffect(() => {
        let total = 0;
        timesheets.forEach((ts) => {
            total += ts.duration!;
        });
        setTotalHours(total);
    }, [timesheetDate, timesheets]);

    // every second, calculate total hours
    useEffect(() => {
        // Calculate total hours every second
        // This is to account for the time spent on the current day
        const interval = setInterval(() => {
            let total = 0;
            timesheets.forEach((ts) => {
                total += ts.duration!;
            });

            const prevStartTime = localStorage.getItem("fuse-startTime") ? new Date(JSON.parse(localStorage.getItem("fuse-startTime")!)) : null
            let elapsedSeconds = 0;

            // const isToday = timesheetDate?.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
            const runningTimesheet = JSON.parse(localStorage.getItem("fuse-runningTimesheet") || "null") as TimesheetData | null;
            // if has prevStartTime and running timesheet is not null, check if the running timesheet date is timesheetDate
            const isRunningTimesheetToday = runningTimesheet ? (new Date(runningTimesheet.timesheetDate).setHours(0, 0, 0, 0) === timesheetDate?.setHours(0, 0, 0, 0)) : false;

            if (prevStartTime && isRunningTimesheetToday) {
                const elapsedTime = (new Date()).getTime() - prevStartTime.getTime();
                elapsedSeconds = Math.floor(elapsedTime / 1000);
            }

            setTotalHours(total + elapsedSeconds);
        }, 1000);

        return () => clearInterval(interval);
    }, [timesheetDate, timesheets]);

    const handleSelect = () => {
        setShowSelectOptions(!showSelectOptions);
    };

    const handleClearAll = () => {
        try {
            setModalState({
                title: "Clear",
                showModal: true,
                body: <div>Are you sure you want to delete all timesheets for this day?</div>,
                footer: (
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setModalState({ ...modalState, showModal: false })}
                            className="bg-gray-600 text-white rounded-md px-4 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            No
                        </button>
                        <button
                            onClick={async () => {
                                timesheets.forEach(async (ts) => {
                                    await db.deleteEntity(ts.id!);
                                });
                                setTimesheets([]);
                                toast.success("Task deleted successfully", { position: "top-right" });
                                setModalState({ ...modalState, showModal: false });
                            }}
                            className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Yes
                        </button>
                    </div>
                ),
            });
        } catch (error: any) {
            toast.error("Error deleting timesheet entry!", { position: "top-right" });
            errorDB.add({
                message: error.message,
                stack: error.stack || String(error),
                timestamp: new Date(),
            });
        }
    };

    const handleDeleteSelected = async () => {
        selectedRows.forEach(async (ts) => {
            await db.deleteEntity(ts.id!);
        });
        const newTimesheets = await timesheetService.getTimesheetsOfTheDay();
        setTimesheets(newTimesheets);
        toast.success("Task deleted successfully", { position: "top-right" });
        setShowSelectOptions(true);
    };

    const handleCopySelected = () => {
        setCopiedRows(selectedRows);
        setShowSelectOptions(true);
        setSelectedRows([]);
    };

    const handlePasteSelected = async () => {
        copiedRows.forEach(async (ts: TimesheetData) => {
            const newTimesheet = { ...ts, id: undefined, duration: 0, running: false, createdDate: new Date(), timesheetDate: timesheetDate };
            await db.add(newTimesheet);
        });
        toast.success("Timesheet copied successfully", { position: "top-right" });
        setCopiedRows([]);
        const newTimesheets = await timesheetService.getTimesheetsOfTheDay();
        setTimesheets(newTimesheets);
    };

    return (
        <div className="flex items-center justify-between">
            <div className={`flex space-x-4 rounded-md px-2 py-1 shadow-sm ${timesheets.length > 0 ? "bg-gray-100" : "bg-white"}`}>
                {timesheets.length > 0 && (<>
                    <FuseTooltip content={showSelectOptions ? "Hide Selection" : "Select Items"}>
                        <div
                            className="w-8 h-8 flex items-center justify-center bg-green-100 hover:bg-green-200 rounded-full cursor-pointer transition-all"
                            onClick={handleSelect}
                        // title={showSelectOptions ? "Hide Selection" : "Select Items"}
                        >
                            {showSelectOptions ? <FaTimes className="text-green-600" /> : <FaCheck className="text-green-600" />}
                        </div>
                    </FuseTooltip>

                    <FuseTooltip content="Clear All">
                        <div
                            className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded-full cursor-pointer transition-all"
                            onClick={handleClearAll}
                        // title="Clear All"
                        >
                            <FaTrashAlt className="text-red-600" />
                        </div>
                    </FuseTooltip>
                </>)}
                {showSelectOptions && (<>
                    <FuseTooltip content="Delete Selected">
                        <div
                            className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded-full cursor-pointer transition-all"
                            onClick={selectedRows.length === 0
                                ? () => {
                                        toast.error("No data is selected.", {
                                            position: "top-right",
                                        });
                                    }
                                : () => {
                                        handleDeleteSelected();
                                    }
                            }
                        // title="Delete Selected"
                        >
                            <FaTrash className="text-red-600" />
                        </div>
                    </FuseTooltip>

                    <FuseTooltip content="Copy Selected">
                        <div
                            className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-full cursor-pointer transition-all"
                            onClick={selectedRows.length === 0
                                ? () => {
                                        toast.error("No data is selected.", {
                                            position: "top-right",
                                        });
                                    }
                                : () => {
                                        handleCopySelected();
                                    }
                            }
                        // title="Copy Selected"
                        >
                            <FaCopy className="text-blue-600" />
                        </div>
                    </FuseTooltip>
                </>   
                )}
                {copiedRows.length > 0 && (
                    <FuseTooltip content="Paste Selected">
                        <div
                            className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-full cursor-pointer transition-all"
                            onClick={handlePasteSelected}
                        // title="Paste Selected"
                        >
                            <FaPaste className="text-yellow-600" />
                        </div>
                    </FuseTooltip>
                )}
            </div>

            <div className="flex space-x-6">
                {startTime && <EditableStartTime startTime={startTime} />}
                <div className="text-secondary2 dark:text-secondary3 font-bold">
                    Misc Time:
                    <span className="ml-2 text-secondary2 dark:text-secondary2">
                        {timesheetService.formatDuration(miscTime)}
                    </span>
                </div>
                <div className="text-secondary2 dark:text-secondary3 font-bold">
                    Total Hours:
                    <span className="ml-2 text-secondary2 dark:text-secondary2">
                        {timesheetService.formatDuration(totalHours)}
                    </span>
                </div>
            </div>
        </div>

    );
};

export default TimesheetMoreActions;
