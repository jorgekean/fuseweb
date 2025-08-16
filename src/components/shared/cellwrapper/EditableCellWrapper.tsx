import React, { useState } from 'react';
import { FaPencilAlt } from 'react-icons/fa';

interface EditableCellProps {
    value: any;
    row: any;
    column: any;
    updateData: (rowIndex: number, columnId: string, value: any) => void;
    children: React.ReactNode;
    renderValue?: () => React.ReactNode;
}

export const EditableCellWrapper: React.FC<EditableCellProps> = ({
    value,
    row,
    column,
    updateData,
    children,
    renderValue
}) => {
    const [isEditing, setEditing] = useState(false);

    const handleSave = (newValue: any) => {
        updateData(row.original.id, column.id, newValue);
        setEditing(false);
    };

    return isEditing ? (
        <>
            {React.cloneElement(children as React.ReactElement, {
                defaultValue: value,
                onBlur: (e: any) => handleSave(e?.target?.value ?? value),
                onKeyDown: (e: any) => {
                    if (e.key === 'Enter') handleSave(e.target.value);
                    if (e.key === 'Escape') setEditing(false);
                },
                autoFocus: true,
            })}
        </>
    ) : (
        <div className="relative group">
            <div onDoubleClick={() => setEditing(true)} className="cursor-pointer p-1 pr-6">
                {renderValue ? renderValue() : (value?.toString() || <span className="text-muted"></span>)}
            </div>
            <FaPencilAlt
                className="
      absolute top-1/2 right-2 transform -translate-y-1/2
      h-4 w-4 text-gray-500 cursor-pointer
      hidden group-hover:block transition-opacity duration-200
    "
                onClick={() => setEditing(true)}
                aria-label="Edit"
            />
        </div>
    );
};