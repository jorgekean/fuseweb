import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSortBy, useTable } from "react-table";
import { FaEdit, FaRegClock, FaTrash } from "react-icons/fa";
import { useGlobalContext } from "../../context/GlobalContext";
import { TimesheetService } from "./TimesheetService";
import DexieUtils from "../../utils/dexie-utils";
import { TimesheetData } from "../../models/Timesheet";
import { ErrorModel } from "../../models/ErrorModel";
import { SettingsService } from "../settings/SettingsService";
import TimerComponent from "./TimerComponent";
import toast from "react-hot-toast";
import TimesheetMoreActions from "./TimesheetMoreActions";
import { useTimesheetContext } from "./TimesheetContext";
import { MiscTimeData } from "../../models/MiscTime";
import { debounce } from "lodash";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";

import { v4 as uuidv4 } from "uuid"
import { InputCellRenderer } from "../../components/shared/cellwrapper/InputCellRenderer";
import ProjectCellEditor from "./celleditor/ProjectCellEditor";
import { BillingManagerModel } from "../../models/BillingManager";

interface TimeTrackingTableProps { }

const TimeTrackingTable: React.FC<TimeTrackingTableProps> = () => {
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const {
    timesheets,
    timesheetDate,
    modalState,
    miscTime,
    setTimesheets,
    editingTimesheet,
    showComments,
    setEditingTimesheet,
    setModalState,
    setMiscTime,
    updateTimesheetItem,
  } = useGlobalContext();
  const { showSelectOptions, selectedRows, setSelectedRows } =
    useTimesheetContext();

  const [projectOptions, setProjectOptions] = useState<BillingManagerModel[]>([])

  // Set up state for sorting, get local storage value if available
  const storedSorting = localStorage.getItem("sorting");
  const [sorting, setSorting] = useState<{ id: string, desc: boolean }[]>(storedSorting ? JSON.parse(storedSorting) : [{ id: "createdDate", desc: false }]);

  const db = DexieUtils<TimesheetData>({
    tableName: "timesheet",
  });
  const billingManagerDB = DexieUtils<BillingManagerModel>({
    tableName: "billingManager",
  });
  const errorDB = DexieUtils<ErrorModel>({
    tableName: "fuse-logs",
  });
  const miscDB = DexieUtils<MiscTimeData>({
    tableName: "miscTime",
  });

  const timesheetService = TimesheetService();
  const settingsService = SettingsService();


  const populateBillingOptions = async () => {
    // Fetch and populate options
    const billings = (await billingManagerDB.getAll()).filter(
      (x) => !x.isArchived
    ).sort((a, b) => {
      if (a.client < b.client) return -1; // a comes before b
      if (a.client > b.client) return 1;  // a comes after b
      return 0; // a and b are equal
    });
    setProjectOptions(billings)
  }

  const fetchMiscTime = async () => {
    const allTimers = await miscDB.getAll();
    return allTimers.find(
      (f) =>
        f.timesheetDate.setHours(0, 0, 0, 0) ===
        timesheetDate.setHours(0, 0, 0, 0)
    );
  };

  const copyPrevTimesheets = async () => {
    try {
      if (
        timesheetDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
      ) {
        const copyTimesheetSetting = await settingsService.getSettingByType(
          "copytimesheet"
        );
        if (copyTimesheetSetting && copyTimesheetSetting.value) {
          const recentTimesheets = (await db.getAll())
            .filter((timesheet) => {
              return (
                timesheet.timesheetDate.setHours(0, 0, 0, 0) <=
                new Date().setHours(0, 0, 0, 0)
              );
            })
            .sort(
              (a, b) => b.timesheetDate.getTime() - a.timesheetDate.getTime()
            );
          const todaysTimesheets =
            await timesheetService.getTimesheetsOfTheDay();
          if (recentTimesheets && todaysTimesheets.length === 0) {
            const copiedTimesheets = (await db.getAll()).filter(
              (x) =>
                x.timesheetDate.setHours(0, 0, 0, 0) ===
                recentTimesheets[0].timesheetDate.setHours(0, 0, 0, 0)
            );

            for (const row of copiedTimesheets) {
              row.timesheetDate = timesheetDate;
              row.createdDate = new Date();
              row.duration = 0;
              row.running = false;

              await db.add(row);
            }
            const timesheetsOfToday =
              await timesheetService.getTimesheetsOfTheDay();
            setTimesheets(timesheetsOfToday);

            // set flag to true to indicate that timesheets were copied and will not be copied again
            localStorage.setItem("fuse-timesheets-copied", "true");
          }
        }
      }
    } catch (error: any) {
      console.error("Error copying data:", error);
      errorDB.add({
        message: error.message,
        stack: error.stack || String(error),
        timestamp: new Date(),
      });
    }
  };

  useEffect(() => {
    const fetchProjectOptions = async () => {
      await populateBillingOptions();
    }

    fetchProjectOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {

      const timesheetsFromDB = await timesheetService.getTimesheetsOfTheDay();
      setTimesheets(timesheetsFromDB);
      setSelectAllChecked(false);
      setSelectedRows([]);

      const miscTimer = await fetchMiscTime();
      setMiscTime(miscTimer?.duration ?? 0);

      // Check if timesheets were copied today      
      if (!(localStorage.getItem("fuse-timesheets-copied") === "true")) {
        await copyPrevTimesheets();
      }
    };
    fetchData();
  }, [timesheetDate]);

  useEffect(() => {
    const isToday =
      new Date().setHours(0, 0, 0, 0) === timesheetDate.setHours(0, 0, 0, 0);

    let intervalId: NodeJS.Timeout | null = null;
    const fetchData = debounce(async () => {
      if (!isToday) {
        return;
      }

      const runningTimesheet = timesheets.find((x) => x.running);
      const storedMiscTime = localStorage.getItem("fuse-miscTime");
      if (!runningTimesheet && !storedMiscTime) {
        localStorage.setItem("fuse-miscTime", JSON.stringify(new Date()));
      }

      const miscTimer = (await miscDB.getAll()).find(
        (x) =>
          x.timesheetDate.setHours(0, 0, 0, 0) ===
          timesheetDate.setHours(0, 0, 0, 0)
      );
      if (runningTimesheet) {
        if (miscTimer) {
          // const elapsedTime = isToday ? currentTime.getTime() - startTime.getTime() : 0;
          const realTimeMiscTime = await calcMiscDuration();
          miscTimer.duration = realTimeMiscTime ?? miscTimer.duration;
          await miscDB.update(miscTimer);
        }

        localStorage.removeItem("fuse-miscTime");
      }

      const calculateMiscTime = async () => {
        const misc = await calcMiscDuration();
        setMiscTime(misc ?? miscTimer?.duration ?? 0);
      };
      intervalId = setInterval(calculateMiscTime, 1000);
    }, 300);
    fetchData();
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      fetchData.cancel();
    };
  }, [timesheetDate, timesheets]);


  const calcMiscDuration = async () => {
    const isToday =
      new Date().setHours(0, 0, 0, 0) === timesheetDate.setHours(0, 0, 0, 0);

    const storedTime = localStorage.getItem("fuse-miscTime");
    if (storedTime) {
      const currentTime = new Date();
      const startTime = new Date(JSON.parse(storedTime));
      if (currentTime instanceof Date && startTime instanceof Date) {
        const elapsedTime = isToday ? currentTime.getTime() - startTime.getTime() : 0;
        const miscTimer = await fetchMiscTime();
        if (miscTimer) {
          return miscTimer.duration! + Math.floor(elapsedTime / 1000);
        }
      }
    }

    return null;
  };

  useEffect(() => {
    if (selectAllChecked) {
      setSelectedRows(timesheets);
    } else {
      setSelectedRows([]);
    }
  }, [selectAllChecked, timesheets]);

  const handleEdit = async (data: TimesheetData) => {
    if (data.running) {
      await timesheetService.processPrevRunningTimesheet();
    }
    const updatedTimesheet = await db.get(data.id!);
    setEditingTimesheet(updatedTimesheet);
    const descriptionInput = document.getElementsByName("taskDescription")[0] as HTMLInputElement;
    if (descriptionInput) {
      descriptionInput.focus();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setModalState({
        title: "Delete",
        showModal: true,
        body: <div>Are you sure you want to delete this?</div>,
        footer: (
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setModalState({ ...modalState, showModal: false });
              }}
              className="bg-gray-600 text-white rounded-md px-4 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              No
            </button>
            <button
              type="button"
              onClick={async () => {
                await db.deleteEntity(id);
                toast.success("Task deleted successfully", {
                  position: "top-right",
                });

                // store ids for deletion in localStorage
                const deletedIds = JSON.parse(
                  localStorage.getItem("fusetimesheets-deletedIds") || "[]"
                );
                deletedIds.push(id);
                localStorage.setItem("fusetimesheets-deletedIds", JSON.stringify(deletedIds));

                const timesheetsOfToday = (await db.getAll())
                  .filter(
                    (f) =>
                      f.timesheetDate.setHours(0, 0, 0, 0) ===
                      timesheetDate.setHours(0, 0, 0, 0)
                  )
                  .sort(
                    (a, b) => a.createdDate.getTime() - b.createdDate.getTime()
                  );
                setTimesheets(timesheetsOfToday);
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

  const handleSelectAllChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectAllChecked(event.target.checked);
  };

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    row: TimesheetData
  ) => {
    if (event.target.checked) {
      setSelectedRows([...selectedRows, row]);
    } else {
      setSelectedRows(selectedRows.filter((x) => x.id !== row.id));
    }
  };

  const handleSort = (accessor: string) => {
    console.log("Sorting by:", accessor);

    // store the sorting state in local storage
    setSorting((prevSorting: { id: string, desc: boolean }[]) => {
      if (prevSorting.length && prevSorting[0].id === accessor) {
        if (prevSorting[0].desc) {
          // If already descending, remove sorting
          localStorage.removeItem("sorting");
          return [];
        } else {
          // Toggle to descending
          localStorage.setItem("sorting", JSON.stringify([{ id: accessor, desc: true }]));
          return [{ id: accessor, desc: true }];
        }
      } else {
        // Default to ascending
        localStorage.setItem("sorting", JSON.stringify([{ id: accessor, desc: false }]));
        return [{ id: accessor, desc: false }];
      }
    });
  };

  const sortedData = useMemo(() => {
    if (!sorting.length) {
      return timesheets;
    }

    const sortById = sorting[0].id;
    const desc = sorting[0].desc;

    return [...timesheets].sort((rowA, rowB) => {
      let valueA, valueB;

      if (sortById === "client.client") {
        valueA = rowA.client?.client || "";
        valueB = rowB.client?.client || "";
      } else if (sortById === "createdDate") {
        return rowB.createdDate.getTime() - rowA.createdDate.getTime();
      } else {
        valueA = rowA[sortById];
        valueB = rowB[sortById];
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return desc ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB);
      }

      if (valueA < valueB) {
        return desc ? 1 : -1;
      }
      if (valueA > valueB) {
        return desc ? -1 : 1;
      }
      return 0;
    });
  }, [timesheets, sorting]);

  const updateMyData = (id: number | string, columnId: string, value: any) => {
    const itemToUpdate = timesheets.find(f => f.id === id);
    console.log(itemToUpdate)
    if (!itemToUpdate) return;

    if (columnId === "client.client") {
      updateTimesheetItem({ id: id, item: { client: value } });
      // update indexdb    
      db.update({ ...itemToUpdate, client: value });

    } else {
      updateTimesheetItem({ id: id, item: { [columnId]: value } });
      // update indexdb    
      db.update({ ...itemToUpdate, [columnId]: value });
    }
  };

  const columns = useMemo(
    () => {
      // The conditional Comments column object
      const commentsColumn = {
        Header: "Comments",
        accessor: "comments", // Assuming your data has a 'comments' property
        Cell: (cell: any) => InputCellRenderer({ ...cell, updateData: updateMyData }),
      };

      // The base set of columns, which now includes the conditional column
      const columnsArray = [
        {
          Header: "Description",
          accessor: "taskDescription",
          Cell: (cell: any) => InputCellRenderer({ ...cell, updateData: updateMyData }),
        },
        // ✅ Conditionally add the Comments column right after "Description"
        ...(showComments ? [commentsColumn] : []),
        {
          Header: "Project",
          accessor: "client.client",
          Cell: (cell: any) => (
            <ProjectCellEditor
              {...cell}
              updateData={updateMyData}
              projectOptions={projectOptions}
            />
          ),
        },
        {
          Header: "Duration",
          accessor: "duration",
          Cell: ({ row }: any) => (
            <TimerComponent
              key={row.original.id}
              timesheet={row.original}
              updateData={updateMyData}
            />
          ),
        },
        {
          Header: " ",
          accessor: "actions",
          disableSortBy: true,
          Cell: ({ row }: any) => (
            <div className="flex justify-center">
              <button
                onClick={() => handleDelete(row.original.id)}
                className="text-secondary2 hover:text-secondary"
              >
                <FaTrash size={20} />
              </button>
            </div>
          ),
        },
      ] as any;

      return columnsArray;
    },
    [timesheetDate, timesheets, showComments]
  );

  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } = useTable(
    {
      columns,
      data: sortedData,
      manualSorting: true,
      state: {
        sortBy: sorting,
      },
      manualSortBy: true,
    },
    useSortBy
  );

  return (
    <div className="space-y-4">
      <TimesheetMoreActions />
      <div className="overflow-auto">
        {timesheets.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center space-x-3">
              <FaRegClock className="text-primary2 animate-pulse" size={50} />
              <p className="text-lg">
                Time is precious, but this table looks a little empty.{" "}
                <span className="font-semibold">Start logging</span> to keep
                track!
              </p>
            </div>
          </div>
        ) : (
          <table
            {...getTableProps()}
            className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
          >
            <thead>
              {headerGroups.map((headerGroup) => {
                const { key, ...restHeaderGroupProps } =
                  headerGroup.getHeaderGroupProps();
                return (
                  <tr
                    key={key}
                    {...restHeaderGroupProps}
                    className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                  >
                    {showSelectOptions && (
                      <th>
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-primary border-gray-300 focus:ring focus:ring-primary4 focus:ring-opacity-50 rounded"
                          checked={selectAllChecked}
                          onChange={handleSelectAllChange}
                        />
                      </th>
                    )}
                    {headerGroup.headers.map((column) => {
                      const { key: columnKey, ...restColumnProps } =
                        column.getHeaderProps(column.getSortByToggleProps());
                      return (
                        <th
                          key={columnKey}
                          {...restColumnProps}
                          className="px-4 py-2 text-left cursor-pointer text-sm font-medium"
                          onClick={() => handleSort(column.id)}
                        >
                          {column.render("Header")}
                          <span>
                            {sorting.length > 0 && sorting[0].id === column.id ? (
                              sorting[0].desc ? (
                                <FiArrowDown className="inline ml-2" />
                              ) : (
                                <FiArrowUp className="inline ml-2" />
                              )
                            ) : (
                              ""
                            )}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                );
              })}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row, index) => {
                prepareRow(row);
                const isRunning = row.original.running;
                const { key, ...rowProps } = row.getRowProps();
                return (
                  <tr
                    key={row.id}
                    {...rowProps}
                    className={`
                      ${editingTimesheet?.id === row.original.id ? "bg-primary5" : index % 2 === 0
                        ? "bg-gray-50 dark:bg-gray-500"
                        : "bg-white dark:bg-gray-600"}
                        ${editingTimesheet?.id === row.original.id ? "" : "hover:bg-gray-100 dark:hover:bg-gray-400 "} transition-colors
                        ${isRunning
                        ? "text-primary font-bold border-l-4 border-primary2 !bg-primary5 bg-opacity-20"
                        : ""
                      }
                        `}
                  >

                    {showSelectOptions && (
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.some(
                            (selectedRow) => selectedRow.id === row.original.id
                          )}
                          onChange={(e) =>
                            handleCheckboxChange(e, row.original)
                          }
                          className="form-checkbox h-5 w-5 text-primary border-gray-300 focus:ring focus:ring-primary4 focus:ring-opacity-50 rounded"
                        />
                      </td>
                    )}
                    {row.cells.map((cell) => {
                      const { key, ...cellProps } = cell.getCellProps();
                      return (
                        <td {...cellProps} key={cell.column.id} className="p-3">
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TimeTrackingTable;