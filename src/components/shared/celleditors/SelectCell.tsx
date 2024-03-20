import { useEffect, useRef } from "react"
import { Form } from "react-bootstrap"

function SelectCell({
  value,
  options,
  onChange,
  onBlur,
}: {
  value: any
  options: any[]
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur: () => void
}) {
  const selectRef = useRef<HTMLSelectElement | null>(null)

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.focus()
    }
  }, [])

  return (
    <Form.Select
      ref={selectRef}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </Form.Select>
  )
}

export default SelectCell
