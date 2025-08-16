import React, { useEffect, useMemo, useState } from "react";
import { useTable } from "react-table";
import { FaTrash } from "react-icons/fa6";
import { useOracleUploadContext } from "./OracleUploadContext";
import { useGlobalContext } from "../../context/GlobalContext";
import { SettingsService } from "../settings/SettingsService";
import { SettingModel } from "../../models/SettingModel";
import DexieUtils from "../../utils/dexie-utils";
import { debounce } from "lodash";

const OracleUploadTable: React.FC = () => {
  const { toUpload, setToUpload, setTotal } = useOracleUploadContext();
  const { showComments, includeCommentsOnUpload, setIncludeCommentsOnUpload } = useGlobalContext();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const settingsDb = DexieUtils<SettingModel>({ tableName: "settings" });
  const settingsService = SettingsService();

  useEffect(() => {
    const handleSettings = debounce(async () => {
      const includeCommentsOnUploadSetting = await settingsService.getSettingByType("includecommentsonupload");
      if (includeCommentsOnUploadSetting) {
        setIncludeCommentsOnUpload(includeCommentsOnUploadSetting.value as boolean);
      }
    }, 500);

    handleSettings();
  }, []);


  const handleIncludeComments = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.checked
    setIncludeCommentsOnUpload(newValue)

    const includeCommentsOnUploadSetting = (await settingsDb.getAll()).find(
      (x) => x.type === "includecommentsonupload"
    )
    if (includeCommentsOnUploadSetting) {
      includeCommentsOnUploadSetting.value = newValue
      await settingsDb.update(includeCommentsOnUploadSetting)
    }
  }

  const handleDelete = async (id: string) => {
    const updatedRow = toUpload.filter((x) => x.id !== id);
    setToUpload(updatedRow);
  };

  const calculateTotals = useMemo(() => {
    const totals = {
      client: "Total",
      taskDescription: "",
      workLoc: { description: "" },
      projectCode: "",
      taskCode: "",
      sunHours: 0,
      monHours: 0,
      tueHours: 0,
      wedHours: 0,
      thuHours: 0,
      friHours: 0,
      satHours: 0,
      grandTotal: 0, // Grand total initialization
    };

    toUpload.forEach((row) => {
      totals.sunHours += parseFloat((row.sunHours || 0).toFixed(2));
      totals.monHours += parseFloat((row.monHours || 0).toFixed(2));
      totals.tueHours += parseFloat((row.tueHours || 0).toFixed(2));
      totals.wedHours += parseFloat((row.wedHours || 0).toFixed(2));
      totals.thuHours += parseFloat((row.thuHours || 0).toFixed(2));
      totals.friHours += parseFloat((row.friHours || 0).toFixed(2));
      totals.satHours += parseFloat((row.satHours || 0).toFixed(2));
    });

    // Calculate the grand total (sum of all day totals)
    totals.grandTotal = parseFloat((
      totals.sunHours +
      totals.monHours +
      totals.tueHours +
      totals.wedHours +
      totals.thuHours +
      totals.friHours +
      totals.satHours).toFixed(2));

    setTotal(totals);

    return totals;
  }, [toUpload])

  const totals = calculateTotals;

  const columns = useMemo(
    () => [
      { Header: "Client", accessor: "client" },
      { Header: "Description", accessor: "taskDescription" },
      { Header: "Location", accessor: "workLoc.description" },
      { Header: "BillingCode", accessor: "projectCode" },
      { Header: "TaskCode", accessor: "taskCode" },
      { Header: "Sun", accessor: "sunHours" },
      { Header: "Mon", accessor: "monHours" },
      { Header: "Tue", accessor: "tueHours" },
      { Header: "Wed", accessor: "wedHours" },
      { Header: "Thu", accessor: "thuHours" },
      { Header: "Fri", accessor: "friHours" },
      { Header: "Sat", accessor: "satHours" },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }: any) => (
          <div className="flex justify-center">
            {hoveredRow === row.index && (
              <button
                onClick={() => handleDelete(row.original.id)}
                className="text-secondary2 hover:text-secondary"
              >
                <FaTrash size={20} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [toUpload, hoveredRow]
  );

  // use memo to sort the toUpload array by client name
  const sortedData = useMemo(() => {
    return [...toUpload].sort((a: any, b: any) => {

      const clientA = +a.projectCode;
      const clientB = +b.projectCode;
      if (clientA < clientB) return -1;
      else if (clientA > clientB) return 1;

      // If clients are the same, sort by projectCode and taskCode
      else {
        if (parseFloat(a.taskCode) < parseFloat(b.taskCode)) return -1;
        if (parseFloat(a.taskCode) > parseFloat(b.taskCode)) return 1;
        return 0;
      }

    }
    )
  }, [toUpload]);


  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns: columns as any,
      data: sortedData,
    });



  return (
    <div className="w-full">
      {
        showComments && (
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              {/* The actual checkbox */}
              <input
                type="checkbox"
                id="chkIncludeCommentsOnUpload"
                className="peer hidden"
                checked={includeCommentsOnUpload}
                onChange={handleIncludeComments}
              />

              {/* Label as custom styled checkbox */}
              <label htmlFor="chkIncludeCommentsOnUpload"
                className="w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded-md peer-checked:bg-primary peer-checked:border-primary2 peer-checked:ring-2 peer-checked:ring-primary cursor-pointer"
              >
                <svg
                  className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  viewBox="0 0 20 20"
                >

                  <path d="m6 10 3 3 6-6" />
                </svg>
                {/* Checkmark icon that will appear when checked */}
                {includeCommentsOnUpload && <img src={"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e"}></img>
                }
              </label>
              <label htmlFor="chkIncludeCommentsOnUpload" className="ml-3 block text-sm font-medium text-gray-700">
                Include 'Comments' on the upload?
              </label>
            </div>
          </div>
        )
      }

      <table
        id="oracle-upload-table"
        {...getTableProps()}
        className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-sm"
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300"
            >
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  className="px-4 py-2 text-left text-sm font-medium"
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                className={`${index % 2 === 0
                  ? "bg-gray-50 dark:bg-gray-500"
                  : "bg-white dark:bg-gray-600"
                  } hover:bg-gray-100 dark:hover:bg-gray-400`}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    className="px-4 py-2 text-gray-700 dark:text-gray-200 text-sm"
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}

          {/* Totals Row */}
          <tr className="bg-gray-200 dark:bg-gray-700 font-bold">
            {columns.map((column, index) => (
              <td
                key={index}
                className="px-4 py-2 text-gray-800 dark:text-gray-300 text-sm text-center"
              >
                {column.accessor === "client"
                  ? totals[column.accessor]
                  : column.accessor === "actions"
                    ? totals.grandTotal.toFixed(2)
                    : totals[column.accessor] || totals[column.accessor] === 0
                      ? (totals[column.accessor]).toFixed(2)
                      : ""}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OracleUploadTable;
