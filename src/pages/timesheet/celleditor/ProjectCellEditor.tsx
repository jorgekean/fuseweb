import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select'; // Import react-select
import classNames from 'classnames'; // Optional, for cleaner class string concatenation
import FuseTooltip from '../../../components/shared/FuseTooltip';
import { FaPencilAlt } from 'react-icons/fa';

// Define the expected props for your ProjectCell
interface ProjectCellProps {
    value: any; // The current value of the cell (e.g., row.original.client.client)
    row: { original: any; index: number }; // Provides the full original row data and index
    column: { id: string }; // Provides the column ID (e.g., 'client')
    updateData: (id: number | string, columnId: string, value: any) => void;
    projectOptions: any[]; // The array of project options for the select
}

const ProjectCell: React.FC<ProjectCellProps> = ({
    row,
    column,
    updateData,
    projectOptions,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    // selectedProject should hold the *object* that react-select expects
    // react-select typically expects { value: 'id', label: 'display' } for its options
    const [selectedProject, setSelectedProject] = useState(row.original.client);
    const cellRef = useRef<HTMLDivElement>(null); // Ref for detecting clicks outside

    // Ensure selectedProject is always aligned with row.original.client
    useEffect(() => {
        setSelectedProject(row.original.client);
    }, [row.original.client]);

    // Handle outside clicks to exit edit mode
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isEditing && cellRef.current && !cellRef.current.contains(event.target as Node)) {
                setIsEditing(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing]);

    const handleSelectChange = (newValue: any) => {
        // newValue is the full option object selected from react-select
        console.log("Selected Project (react-select):", newValue);
        setSelectedProject(newValue); // Update local state with the selected object
        // Call the updateData function with the row's unique ID and the full new value object
        updateData(row.original.id, column.id, newValue);
        setIsEditing(false); // Exit edit mode after selection
    };

    const handleDoubleClick = () => {
        console.log(selectedProject, projectOptions)
        setIsEditing(true);
    };

    // Prepare options for react-select: { value: id, label: client }
    // Assuming projectOptions are already in the format { id: '...', client: '...' }
    const formattedOptions = projectOptions.map(option => ({
        value: option.id,
        label: option.client,
        ...option // Spread the rest of the original option if needed for updateData
    }));

    // Find the currently selected option in the formattedOptions list
    const currentSelectValue = selectedProject ?
        formattedOptions.find(option => option.value === selectedProject.id) : null;

    // Render the Select component if in editing mode
    if (isEditing) {
        return (
            <div ref={cellRef} tabIndex={0} // tabIndex makes div focusable for onBlur detection
                onBlur={(e) => {
                    // Only exit editing if the blur event is not from within the select itself
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setIsEditing(false);
                    }
                }}
                style={{ zIndex: 9999999 }} // High z-index for the editable wrapper
            >
                <Select
                    options={formattedOptions}
                    value={currentSelectValue}
                    onChange={handleSelectChange}
                    placeholder="Select a Project"
                    isClearable={false} // Allows clearing the selection
                    isSearchable={true} // Allows typing to search
                    autoFocus // Automatically focus when it appears
                    menuPortalTarget={document.body} // Crucial for z-index issues
                    styles={{ // Custom styles to make it blend with your table cell
                        control: (provided) => ({
                            ...provided,
                            minHeight: '34px', // Adjust height to match your cell
                            borderColor: 'rgb(209 213 219)', // gray-300
                            boxShadow: 'none',
                            '&:hover': { borderColor: 'rgb(209 213 219)' },
                        }),
                        valueContainer: (provided) => ({
                            ...provided,
                            padding: '0px 8px', // Adjust padding
                        }),
                        input: (provided) => ({
                            ...provided,
                            margin: '0px',
                        }),
                        indicatorSeparator: () => ({ display: 'none' }),
                        indicatorsContainer: (provided) => ({
                            ...provided,
                            height: '34px',
                        }),
                        menu: (provided) => ({
                            ...provided,
                            zIndex: 9999999, // Ensure dropdown menu is also on top
                        }),
                        menuPortal: base => ({ ...base, zIndex: 9999999 }) // Portal specific z-index
                    }}
                />
            </div>
        );
    }

    // Otherwise, render the styled span for display
    return (
        <div className="relative group">
            <FuseTooltip content={`${row.original.client?.projectCode} - ${row.original.client?.taskCode}`} isTopFull={false}>
                <span
                    ref={cellRef}
                    onDoubleClick={handleDoubleClick}
                    className={classNames(
                        `text-gray-800 text-sm font-medium py-1 px-3 pr-8 rounded-md`,
                        `bg-primary4 bg-opacity-20 hover:bg-primary5 dark:bg-primary4 dark:hover:bg-primary5`,
                        `cursor-pointer`
                    )}
                >
                    {selectedProject?.client}
                </span>
            </FuseTooltip>
            <FaPencilAlt
                className="
            absolute top-1/2 right-2 transform -translate-y-1/2
            h-4 w-4 text-gray-500 cursor-pointer
            hidden group-hover:block transition-opacity duration-200
        "
                onClick={handleDoubleClick}
                aria-label="Edit"
            />
        </div>
    );
};

export default ProjectCell;