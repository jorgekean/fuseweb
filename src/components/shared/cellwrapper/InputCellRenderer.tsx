

import { EditableCellWrapper } from './EditableCellWrapper';

export const InputCellRenderer = (cellProps: any) => (
    <EditableCellWrapper {...cellProps}>
        <input
            autoComplete='off'
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary2 dark:bg-gray-800"
        />
    </EditableCellWrapper>
);

// export const NumberInputCellRenderer = (cellProps: any) => (
//     <EditableCellWrapper {...cellProps}>
//         <Form.Control size="sm" type="number" />
//     </EditableCellWrapper>
// );

// export const CheckboxCellRenderer = ({ value, row, column, updateData }: any) => (
//     <Form.Check
//         type="checkbox"
//         checked={!!value}
//         onChange={(e) => updateData(row.index, column.id, e.target.checked)}
//     />
// );

// // type Option = Record<string, any>;

// // type SelectCellRendererProps = {
// //     value: any;
// //     row: any;
// //     column: any;
// //     updateData: (rowIndex: number, columnId: string, value: any) => void;
// // };

// // export const SelectCellRenderer = (
// //     cellProps: SelectCellRendererProps,
// //     options: Option[],
// //     labelKey: string = 'label',
// //     valueKey: string = 'value'
// // ) => {
// //     const { value, row, column, updateData } = cellProps;

// //     return (
// //         <EditableCellWrapper {...cellProps}>
// //             <Form.Select
// //                 size="sm"
// //                 value={value}
// //                 onChange={(e) =>
// //                     updateData(row.index, column.id, e.target.value)
// //                 }
// //             >
// //                 <option value="">Select</option>
// //                 {options.map((opt) => (
// //                     <option key={opt[valueKey]} value={opt[valueKey]}>
// //                         {opt[labelKey]}
// //                     </option>
// //                 ))}
// //             </Form.Select>
// //         </EditableCellWrapper>
// //     );
// // };

// export const HtmlInputCellRenderer = ({ value, row, column }: any) => {
//     return (
//         <div
//             dangerouslySetInnerHTML={{ __html: value }}
//             className="cursor-pointer p-1"
//         />
//     );
// };