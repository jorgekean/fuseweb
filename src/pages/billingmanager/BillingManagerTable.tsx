import React, { useEffect, useRef, useState } from "react"
import { Column, useSortBy, useTable } from "react-table"
import { FaArchive, FaEdit, FaRegClock, FaTrash } from "react-icons/fa"
import { useGlobalContext } from "../../context/GlobalContext"
// import { TimesheetService } from './TimesheetService';
import { FaClock, FaClockRotateLeft, FaCoins, FaFileImport } from "react-icons/fa6"
// import { FcAlarmClock, FcClock } from 'react-icons/fc';
import { BillingManagerModel } from "../../models/BillingManager"
import DexieUtils from "../../utils/dexie-utils"
import { ErrorModel } from "../../models/ErrorModel"
import toast from "react-hot-toast"
import { BillingTypeOptions, useBillingManagerContext } from "./BillingManagerContext"
import { FiArrowDown, FiArrowUp, FiEye, FiEyeOff } from "react-icons/fi"
import BillingManagerMoreActions from "./BillingManagerMoreActions"
import { BillingManagerService } from "./BillingManagerService"
import FuseTooltip from "../../components/shared/FuseTooltip"
import {
  UseSortByColumnProps,
  UseSortByInstanceProps,
  UseSortByState,
} from "react-table";
import { InputCellRenderer } from "../../components/shared/cellwrapper/InputCellRenderer"
import BillingTypeCellEditor from "./celleditor/BillingTypeCellEditor"

declare module "react-table" {
  export interface TableInstance<D extends object = {}>
    extends UseSortByInstanceProps<D> { }
  export interface TableState<D extends object = {}> extends UseSortByState<D> { }
  export interface ColumnInstance<D extends object = {}>
    extends UseSortByColumnProps<D> { }
}

interface BillingManagerTableProps {
  // entries: TimesheetData[];
  // onEdit: (id: number) => void;
  // onDelete: (id: number) => void;
}

const BillingManagerTable: React.FC<BillingManagerTableProps> = ({ }) => {

  // const [selectAllChecked, setSelectAllChecked] = useState(false)
  // const [searchTerm, setSearchTerm] = useState("")



  const { modalState, setModalState, setEditingBillingManager, editingBillingManager } =
    useGlobalContext()
  const billingManagerService = BillingManagerService()

  const { billings, setBillings, showArchived, searchTerm, setSearchTerm, setShowArchived, selectAllChecked, setSelectAllChecked, showSelectOptions,
    setShowSelectOptions, selectedRows, setSelectedRows, updateBillingData } =
    useBillingManagerContext()

  const db = DexieUtils<BillingManagerModel>({
    tableName: "billingManager",
  })
  const errorDB = DexieUtils<ErrorModel>({
    tableName: "fuse-logs",
  })

  const handleError = (error: any, message: string) => {
    toast.error(message, { position: "top-right" });
    errorDB.add({
      message: error.message,
      stack: error.stack || String(error),
      timestamp: new Date(),
    });
  };

  useEffect(() => {
    setSelectAllChecked(false)
    setSelectedRows([])
  }, [])

  useEffect(() => {
    if (selectAllChecked) {
      setSelectedRows(billings)
    } else {
      setSelectedRows([])
    }
  }, [selectAllChecked])

  useEffect(() => {
    const fetchData = async () => {
      await billingManagerService.getBillingData(searchTerm, showArchived)
    }

    fetchData()
  }, [showArchived, searchTerm])



  const handleEdit = async (data: BillingManagerModel) => {
    setEditingBillingManager(data)

    // focus on the project name input
    const projNameInput = document.getElementsByName("client")[0] as HTMLInputElement
    if (projNameInput) {
      projNameInput.focus()
    }
  }

  const handleDelete = (id: string) => {
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
                setModalState({ ...modalState, showModal: false })
              }}
              className="bg-gray-600 text-white rounded-md px-4 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              No
            </button>
            <button
              onClick={async () => {
                await db.deleteEntity(id)
                toast.success("Billing deleted successfully", {
                  position: "top-right",
                })

                // store ids for deletion in localStorage
                const deletedIds = JSON.parse(
                  localStorage.getItem("fusebilling-deletedIds") || "[]"
                );
                deletedIds.push(id);
                localStorage.setItem("fusebilling-deletedIds", JSON.stringify(deletedIds));

                // refresh
                await billingManagerService.getBillingData(searchTerm, showArchived)

                setModalState({ ...modalState, showModal: false })
              }}
              className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Yes
            </button>
          </div>
        ),
      })
    } catch (error: any) {
      handleError(error, "Error deleting billing!")
    }
  }

  const handleArchiveToggle = (id: string, isArchived: boolean) => {
    try {
      const action = isArchived ? "Unarchive" : "Archive"
      setModalState({
        title: action,
        showModal: true,
        body: (
          <div>
            Are you sure you want to {action.toLowerCase()} this record?
          </div>
        ),
        footer: (
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setModalState({ ...modalState, showModal: false })
              }}
              className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              No
            </button>
            <button
              onClick={async () => {
                const billing = await db.get(id)
                if (billing) {
                  billing.isArchived = !isArchived
                  await db.update(billing)
                  toast.success(
                    `Billing ${action.toLowerCase()}d successfully`,
                    {
                      position: "top-right",
                    }
                  )
                  // refresh
                  await billingManagerService.getBillingData(searchTerm, showArchived)

                  setModalState({ ...modalState, showModal: false })
                }
              }}
              className="bg-primary text-white rounded-md px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary2"
            >
              Yes
            </button>
          </div>
        ),
      })
    } catch (error: any) {
      handleError(error, "Error toggling archive status!")
    }
  }

  const handleSelectAllChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectAllChecked(event.target.checked)
  }

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    row: BillingManagerModel
  ) => {
    if (event.target.checked) {
      // alert(JSON.stringify(row))
      setSelectedRows([...selectedRows, row])
    } else {
      setSelectedRows(selectedRows.filter((x) => x.id !== row.id))
    }
  }


  const updateMyData = (id: number | string, columnId: string, value: any) => {
    const itemToUpdate = billings.find(f => f.id === id);
    console.log(itemToUpdate)
    if (!itemToUpdate) return;

    // Check if client name already exists
    const clientExists = billings.some(
      (billing) => billing.client === value && billing.id !== id
    )
    if (clientExists) {
      // Display error message if project name already exists
      toast.error("Project Name already exists!", { position: "top-right" })
      return
    }

    updateBillingData({ id: id, item: { [columnId]: value } });
    // update indexdb    
    db.update({ ...itemToUpdate, [columnId]: value });
  };

  const columns: Column<BillingManagerModel>[] = React.useMemo(
    () =>
      [
        {
          Header: "Project",
          accessor: "client",
          minWidth: 100,
          width: 600,
          Cell: (cell: any) => InputCellRenderer({ ...cell, updateData: updateMyData }),
        },
        {
          Header: "Project Code",
          accessor: "projectCode",
          minWidth: 100,
          width: 300,
          Cell: (cell: any) => InputCellRenderer({ ...cell, updateData: updateMyData }),
        },
        {
          Header: "Task Code",
          accessor: "taskCode",
          minWidth: 100,
          width: 300,
          Cell: (cell: any) => InputCellRenderer({ ...cell, updateData: updateMyData }),
        },
        {
          Header: "Billing Type",
          accessor: "billingType",
          minWidth: 100,
          width: 300,
          Cell: (cell: any) => (
            <BillingTypeCellEditor
              {...cell}
              updateData={updateMyData}
              options={BillingTypeOptions}
            />
          )
        },
      ] as any,
    [billings]
  )

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: billings,
    }, useSortBy)

  return (
    <div >
      <div
        className="bg-white dark:bg-gray-800 p-4 shadow-md sticky  sm:top-[15%] md:top-[10%] lg:top-[0%] xl:top-[0%] z-20">
        <div className="flex flex-wrap justify-between items-center mb-2 gap-4">
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => {
              setSearchTerm(e.currentTarget.value)
            }}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary2 dark:bg-gray-800 w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
          />
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center px-4 py-2 border border-primary2 text-primary2 rounded-md hover:bg-gray-50 focus:outline-none"
          >
            {showArchived ? (
              <FiEyeOff className="mr-2" />
            ) : (
              <FiEye className="mr-2" />
            )}
            {showArchived ? "Hide Archived" : "Show Archived"}
          </button>
        </div>
        <div className="flex my-2  ">
          <BillingManagerMoreActions />
        </div>
      </div>
      {billings.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center space-x-3">
            <FaCoins className="text-primary2 animate-pulse" size={50} />
            <p className="text-lg">No Billing Data to show.</p>
          </div>
        </div>
      ) : (
        <table
          {...getTableProps()}
          className="min-w-full bg-white dark:bg-gray-800 rounded-lg "
        >
          <thead
            className="bg-white dark:bg-gray-800 p-0 rounded-lg shadow-md sticky sm:top-[35%] md:top-[30%] lg:top-[25%] xl:top-[19%] 2xl:top-[15%] z-20"
          >
            {headerGroups.map((headerGroup) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
              >
                {showSelectOptions && (
                  <th>
                    {" "}
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-primary border-gray-300 focus:ring focus:ring-primary4 focus:ring-opacity-50 rounded"
                      checked={selectAllChecked}
                      onChange={handleSelectAllChange}
                    />
                  </th>
                )}
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="p-3 text-left cursor-pointer">
                    {column.render("Header")}
                    <span>
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <FiArrowDown className="inline ml-2" />
                        ) : (
                          <FiArrowUp className="inline ml-2" />
                        )
                      ) : (
                        ""
                      )}
                    </span>
                  </th>
                ))}
                <th></th>
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, index) => {
              prepareRow(row)
              return (
                <tr
                  {...row.getRowProps()}
                  className={`${editingBillingManager?.id === row.original.id ? "bg-primary5" : index % 2 === 0
                    ? "bg-gray-50 dark:bg-gray-500"
                    : "bg-white dark:bg-gray-600"}
                    ${editingBillingManager?.id === row.original.id ? "" : "hover:bg-gray-100 dark:hover:bg-gray-400 "}
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
                    return (
                      <td {...cell.getCellProps()} className="p-3">
                        {cell.render("Cell")}
                      </td>
                    )
                  })}

                  <td className="flex justify-end space-x-2 p-2">

                    <FuseTooltip content="Delete">
                      <button
                        onClick={() => handleDelete(row.original.id as string)}
                        className="text-secondary2 hover:text-secondary"
                      // title="Delete"
                      >
                        <FaTrash size={20} />
                      </button>
                    </FuseTooltip>

                    <FuseTooltip content={row.original.isArchived ? "Unarchive" : "Archive"}>
                      <button
                        onClick={() =>
                          handleArchiveToggle(
                            row.original.id as string,
                            row.original.isArchived!
                          )
                        }
                        className={`${row.original.isArchived
                          ? "text-green-500 hover:text-green-700"
                          : "text-yellow-500 hover:text-yellow-700"
                          }`}
                      // title={row.original.isArchived ? "Unarchive" : "Archive"}
                      >
                        <FaArchive size={20} />
                      </button>
                    </FuseTooltip>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default BillingManagerTable
