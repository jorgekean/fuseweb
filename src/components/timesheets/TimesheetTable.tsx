import React, { KeyboardEventHandler, useEffect, useRef, useState } from "react"
import { Column, ColumnInstance, useSortBy, useTable } from "react-table"
import {
  PlayCircle,
  PauseCircle,
  Pause,
  Trash2,
  Copy,
  Trash,
  Clipboard,
} from "react-feather"
import DurationCell from "./celleditors/DurationCell"
import {
  Button,
  Col,
  Form,
  FormControl,
  InputGroup,
  Row,
} from "react-bootstrap"
import DexieUtils from "../../utils/dexie-utils"
import { TimesheetData } from "../../models/Timesheet"
import InputCell from "../shared/celleditors/InputCell"
import { BillingManagerModel } from "../../models/BillingManager"
import DurationTimer from "./DurationTimer"
import { Typeahead } from "react-bootstrap-typeahead"

interface TimesheetTableProps {
  timesheetDate: Date
  timesheetChanged: boolean
}

const TimesheetTable: React.FC<TimesheetTableProps> = ({
  timesheetDate,
  timesheetChanged,
}) => {
  const [editableCell, setEditableCell] = useState<{
    rowId: string
    columnName: string
    selectedClient: {
      client: string
      taskCode: string
      projectCode: string
    }
  } | null>(null)

  const [timesheetData, setTimesheetData] = useState<TimesheetData[]>([])
  const [copiedTimesheets, setCopiedTimesheets] = useState<TimesheetData[]>([])
  // const onTimesheetDBChange = () => {
  //   console.log("changing")
  // }

  const db = DexieUtils<TimesheetData>({
    tableName: "timesheet",
  })
  const billingManagerDB = DexieUtils<BillingManagerModel>({
    tableName: "billingManager",
  })
  const copiedTimesheetsDB = DexieUtils<TimesheetData>({
    tableName: "copiedTimesheet",
  })

  const [options, setOptions] = useState<any[]>([])
  const [selectedRows, setSelectedRows] = useState<TimesheetData[]>([])
  const [selectAllChecked, setSelectAllChecked] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // populate options
      const billings = await billingManagerDB.getAll()
      const billingOptions = billings.map((b) => ({
        client: b.client,
        value: b.taskCode,
        projectCode: b.projectCode,
      }))
      console.log(billingOptions)
      setOptions(billingOptions)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (selectAllChecked) {
      setSelectedRows(timesheetData)
    } else {
      setSelectedRows([])
    }
  }, [selectAllChecked, timesheetData])

  useEffect(() => {
    const fetchData = async () => {
      getTimesheetsOfTheDay()
      getCopiedTimesheets()

      setSelectAllChecked(false)
      setSelectedRows([])
    }
    fetchData()
  }, [timesheetDate, timesheetChanged])

  const handleEdit = (id: string, field: keyof TimesheetData, value: any) => {
    console.log(id, field, value)
    setTimesheetData((prevData) =>
      prevData.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  const getTimesheetsOfTheDay = async () => {
    const selectedTimesheetDate = timesheetDate.setHours(0, 0, 0, 0)
    const timesheetsOfToday = (await db.getAll())
      .filter(
        (f) => f.timesheetDate.setHours(0, 0, 0, 0) === selectedTimesheetDate
      )
      .sort((a, b) => a.createdDate.getTime() - b.createdDate.getTime())
    setTimesheetData(timesheetsOfToday)
  }

  const getCopiedTimesheets = async () => {
    const copiedTS = await copiedTimesheetsDB.getAll()
    setCopiedTimesheets(copiedTS)
  }

  const updateTimesheet = async (timesheetData: TimesheetData) => {
    await db.update(timesheetData)
  }

  function handleClientChange(
    id: string,
    field: keyof TimesheetData,
    value: any
  ) {
    // const { name, value } = event.target
    const selectedClient = value ? value[0] : undefined
    console.log(id, field, selectedClient)
    if (selectedClient) {
      setTimesheetData((prevData) =>
        prevData.map((row) =>
          row.id === id
            ? {
                ...row,
                [field]: selectedClient,
                ["clientStr"]: selectedClient.client,
              }
            : row
        )
      )
    }

    // change the select UI
    setEditableCell((prevState: any) => ({
      ...prevState,
      selectedClient: selectedClient,
    }))
    // setFormData((prevState) => ({
    //   ...prevState,
    //   [name]: selectedClient,
    //   clientStr: selectedClient.client,
    // }))
  }

  function SelectCell({
    value,
    onChange,
    onBlur,
  }: {
    value: any
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    onBlur: () => void
  }) {
    const selectRef = useRef<HTMLSelectElement | HTMLInputElement | null>(null)

    useEffect(() => {
      const fetchData = async () => {
        console.log("selectRef", selectRef)
        if (selectRef.current) {
          selectRef.current.focus()
        }
      }
      fetchData()
    }, [])

    return (
      <Typeahead
        id="clientTypeahead"
        ref={selectRef}
        labelKey={"client"}
        onChange={(selected) =>
          handleClientChange(editableCell?.rowId as string, "client", selected)
        }
        options={options}
        onBlur={onBlur}
        // onInputChange={}
        selected={value ? [value] : []}
      />
    )
  }

  const handleDelete = (id: string) => {
    // Implement delete logic here
    console.log("Deleting row with ID:", id)
    db.deleteEntity(id)

    // refresh
    getTimesheetsOfTheDay()
  }

  const columns: Column<TimesheetData>[] = React.useMemo(
    () => [
      // { Header: 'ID', accessor: 'id' },
      {
        Header: "Client",
        accessor: "clientStr",
        Cell: SelectCell,
        minWidth: 100,
        width: 300,
      },
      {
        Header: "Task Description",
        accessor: "taskDescription",
        Cell: InputCell,
        minWidth: 100,
        width: 600,
      },
      {
        Header: (
          <div className="float-end">
            <span>Duration</span>
          </div>
        ),
        accessor: "duration",
        Cell: InputCell,
        minWidth: 50,
        width: 150,
      },
    ],
    [editableCell]
  )

  // TEMPLATE
  function EditableCell({
    cell: { value },
    row,
    column,
    CellEditor,
  }: {
    cell: { value: any }
    row: { original: TimesheetData }
    column: ColumnInstance<TimesheetData>
    CellEditor: React.ComponentType<any>
  }) {
    const isEditable =
      editableCell?.rowId === row.original.id &&
      editableCell?.columnName === column.id

    const handleDoubleClick = () => {
      setEditableCell({
        rowId: row.original.id as string,
        columnName: column.id,
        selectedClient: row.original.client as {
          client: string
          taskCode: string
          projectCode: string
        },
      })
    }

    const handleOnBlur = () => {
      setEditableCell(null)

      updateTimesheet(row.original)
    }
    const handleKeyDown: KeyboardEventHandler<HTMLElement> = (e) => {
      if (e.key === "Enter") {
        setEditableCell(null)

        updateTimesheet(row.original)
      }
    }

    const canTrackTime =
      timesheetDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)

    if (column.id === "duration" && canTrackTime) {
      return (
        // Render the DurationTimer component in the cell
        <DurationTimer
          id={row.original.id as string} // Pass the id of the row as the id prop
          duration={row.original.duration} // Pass the duration from the row data
          startTimer={startTimer} // Pass the startTimer function
          isRunning={row.original.id === currentTimerId} // Determine if the timer is running based on the currentTimerId state
        />
      )
    }

    return isEditable ? (
      <CellEditor
        value={value}
        onChange={(e: any) =>
          handleEdit(
            row.original.id as string,
            column.id as keyof TimesheetData,
            e.target.value
          )
        }
        onBlur={handleOnBlur}
        onKeyDown={handleKeyDown}
      />
    ) : (
      <div onDoubleClick={handleDoubleClick}>{value}</div>
    )
  }

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: timesheetData })

  const [currentTimerId, setCurrentTimerId] = useState<string | null>(null)

  const startTimer = async (id: string) => {
    setCurrentTimerId(id)
  }
  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    row: TimesheetData
  ) => {
    if (event.target.checked) {
      setSelectedRows([...selectedRows, row])
    } else {
      setSelectedRows(selectedRows.filter((x) => x.id !== row.id))
    }

    console.log(selectedRows)
  }

  const handleSelectAllChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectAllChecked(event.target.checked)
  }

  const handleOnCopyClick = async () => {
    console.log(selectedRows)
    for (const row of selectedRows) {
      await copiedTimesheetsDB.add(row)
    }

    // Clear the selection after copying
    setSelectedRows([])
  }
  const handleOnPasteClick = async () => {
    console.log(copiedTimesheets)
    for (const row of copiedTimesheets) {
      row.timesheetDate = timesheetDate
      row.createdDate = new Date()
      console.log("loop", row)
      await db.add(row)
    }

    // Clear the selection after copying
    for (const row of copiedTimesheets) {
      copiedTimesheetsDB.deleteEntity(row.id as string)
    }

    setCopiedTimesheets([])

    // refresh the table
    getTimesheetsOfTheDay()
  }

  return (
    <>
      {selectedRows.length > 0 && (
        <Row>
          <Col sm={4}>
            <Button
              size="sm"
              type="submit"
              className="btn btn-fireworksdark"
              title="Copy selected rows"
              onClick={handleOnCopyClick}
            >
              Copy <Copy size={16} />
            </Button>{" "}
            <Button
              size="sm"
              type="submit"
              className="btn btn-danger"
              title="Delete selected rows"
            >
              Delete <Trash2 size={16} />
            </Button>
          </Col>
        </Row>
      )}
      {copiedTimesheets.length > 0 && (
        <Row>
          <Col sm={4}>
            <Button
              size="sm"
              type="submit"
              className="btn btn-fireworksdark"
              title="Paste selected rows"
              onClick={handleOnPasteClick}
            >
              Paste <Clipboard size={16} />
            </Button>
          </Col>
        </Row>
      )}
      <table {...getTableProps()} className="table table-striped table-hover">
        <thead className="thead-dark">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              <th>
                {" "}
                <input
                  type="checkbox"
                  checked={selectAllChecked}
                  onChange={handleSelectAllChange}
                />
              </th>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps({
                    style: { minWidth: column.minWidth, width: column.width },
                  })}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row)
            const isSelected = selectedRows.some(
              (selectedRow) => selectedRow.id === row.original.id
            )
            const rowClassName = isSelected ? "selected-row" : ""
            return (
              <tr {...row.getRowProps()} className={rowClassName}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.some(
                      (selectedRow) => selectedRow.id === row.original.id
                    )}
                    onChange={(e) => handleCheckboxChange(e, row.original)}
                  />
                </td>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()}>
                    <EditableCell
                      cell={cell}
                      row={row}
                      column={cell.column}
                      CellEditor={cell.column.Cell as any}
                    />
                  </td>
                ))}
                <td className="d-flex justify-content-end">
                  <Button
                    className="me-1"
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(row.original.id as string)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

export default TimesheetTable
