import { useEffect, useRef, useState } from "react"
import { Pause, PlayCircle } from "react-feather"
import { TimesheetData } from "../../../models/Timesheet"

const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration / 3600000)
  const minutes = Math.floor((duration % 3600000) / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

const DurationCell: React.FC<{
  value: number
  row: { original: TimesheetData }
  setEditableCell: React.Dispatch<
    React.SetStateAction<{ rowId: string; columnName: string } | null>
  >
}> = ({ value, row, setEditableCell }) => {
  const [editable, setEditable] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (editable && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editable])

  const handleDoubleClick = () => {
    // setEditableCell({
    //   rowId: row.original.id as string,
    //   columnName: "duration",
    // });
    setEditable(true)
  }

  const handleBlur = () => {
    setEditableCell(null)
    setEditable(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle your input change logic here
    // e.target.value contains the entered text
    // You might want to update the 'duration' in the data
  }

  return (
    <div className="float-end" onDoubleClick={handleDoubleClick}>
      {editable ? (
        <input
          ref={inputRef}
          type="text"
          value={formatDuration(value)}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      ) : (
        <>
          {row.original.running ? (
            <span className="text-danger">
              {formatDuration(value)} <Pause size={30} />
            </span>
          ) : (
            <span className="text-success">
              {formatDuration(value)} <PlayCircle size={30} />
            </span>
          )}
        </>
      )}
    </div>
  )
}

export default DurationCell
