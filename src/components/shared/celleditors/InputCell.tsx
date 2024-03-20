import { useEffect, useRef } from "react"
import { FormControl } from "react-bootstrap"

function InputCell({
  value,
  onChange,
  onBlur,
  onKeyDown,
}: {
  value: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <FormControl
      ref={inputRef}
      size="sm"
      type="text"
      value={value}
      // style={{ width: "100%" }}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  )
}

//   function SelectCell({
//     value,
//     options,
//     onChange,
//     onBlur
//   }: {
//     value: any,
//     options: any[],
//     onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
//     onBlur: () => void
//   }) {
//     const selectRef = useRef<HTMLSelectElement | null>(null);

//     useEffect(() => {
//       if (selectRef.current) {
//         selectRef.current.focus();
//       }
//     }, []);

//     return (
//       <Form.Select
//         ref={selectRef}
//         value={value}
//         onChange={onChange}
//         onBlur={onBlur}
//       >
//         {options.map((option, index) => (
//           <option key={index} value={option.value}>{option.label}</option>
//         ))}
//       </Form.Select>
//     );
//   }

export default InputCell
