import React, { KeyboardEventHandler, useEffect, useRef, useState } from "react"
import { Column, ColumnInstance, useSortBy, useTable } from "react-table"
import { Button, Form, FormControl, InputGroup } from "react-bootstrap"
import DexieUtils from "../../utils/dexie-utils"
import { BillingManagerModel } from "../../models/BillingManager"
import InputCell from "../shared/celleditors/InputCell"
import { Trash2 } from "react-feather"

interface BillingManagerTableProps {
  billingmanagerDate: Date
  billingmanagerChanged: boolean
}

const BillingManagerTable: React.FC<BillingManagerTableProps> = ({
  billingmanagerDate,
  billingmanagerChanged,
}) => {
  const [editableCell, setEditableCell] = useState<{
    rowId: string
    columnName: string
  } | null>(null)

  const [billingmanagerData, setBillingManagerModel] = useState<
    BillingManagerModel[]
  >([])

  const db = DexieUtils<BillingManagerModel>({
    tableName: "billingManager",
  })

  useEffect(() => {
    const fetchData = async () => {
      await getBillingData()
    }
    fetchData()
  }, [billingmanagerDate, billingmanagerChanged])

  const getBillingData = async () => {
    db.getAll()
      .then((data) => {
        // Sort the data by the client field
        data.sort((a, b) => a.client.localeCompare(b.client))
        // Set the sorted data to BillingManagerModel
        setBillingManagerModel(data)
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
      })
  }

  const handleEdit = (
    id: string,
    field: keyof BillingManagerModel,
    value: any
  ) => {
    console.log(id, field, value)
    setBillingManagerModel((prevData) =>
      prevData.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  const updateBillingManager = async (
    billingmanagerData: BillingManagerModel
  ) => {
    await db.update(billingmanagerData)
  }

  const handleDelete = (id: string) => {
    // Implement delete logic here
    console.log("Deleting row with ID:", id)
    db.deleteEntity(id)

    // refresh
    getBillingData()
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
    const selectRef = useRef<HTMLSelectElement | null>(null)
    const [options, setOptions] = useState<string[]>([])

    useEffect(() => {
      if (selectRef.current) {
        selectRef.current.focus()
      }

      // populate options
      setOptions(["Billable", "Non-Billable"])
    }, [])

    return (
      <Form.Select
        ref={selectRef}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </Form.Select>
    )
  }

  const columns: Column<BillingManagerModel>[] = React.useMemo(
    () => [
      // { Header: 'ID', accessor: 'id' },
      {
        Header: "Client",
        accessor: "client",
        Cell: InputCell,
        minWidth: 100,
        width: 800,
      },
      {
        Header: "Project Code",
        accessor: "projectCode",
        Cell: InputCell,
        minWidth: 100,
        width: 300,
      },
      {
        Header: "Task Code",
        accessor: "taskCode",
        Cell: InputCell,
        minWidth: 100,
        width: 200,
      },
      // {
      //   Header: "Billing Type",
      //   accessor: "billingType",
      //   Cell: SelectCell,
      //   minWidth: 100,
      //   width: 200,
      // },
      // {
      //   Header: "Allocated Hours",
      //   accessor: "allocatedHours",
      //   Cell: InputCell,
      // },
      // { Header: "Actual Hours", accessor: "actualHours" },
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
    row: { original: BillingManagerModel }
    column: ColumnInstance<BillingManagerModel>
    CellEditor: React.ComponentType<any>
  }) {
    const isEditable =
      editableCell?.rowId === row.original.id &&
      editableCell?.columnName === column.id

    const handleDoubleClick = () => {
      setEditableCell({
        rowId: row.original.id as string,
        columnName: column.id,
      })
    }

    const handleOnBlur = () => {
      setEditableCell(null)

      updateBillingManager(row.original)
    }
    const handleKeyDown: KeyboardEventHandler<HTMLElement> = (e) => {
      if (e.key === "Enter") {
        setEditableCell(null)

        updateBillingManager(row.original)
      }
    }

    return isEditable ? (
      <CellEditor
        value={value}
        onChange={(e: any) =>
          handleEdit(
            row.original.id as string,
            column.id as keyof BillingManagerModel,
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

  // TEMPLATE

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: billingmanagerData,
    })

  return (
    <table {...getTableProps()} className="table table-striped table-hover">
      <thead className="thead-dark">
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
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
          return (
            <tr {...row.getRowProps()}>
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
  )
}

export default BillingManagerTable
