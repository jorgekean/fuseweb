import React from 'react';

interface CheckboxProps {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
}

const FuseCheckbox: React.FC<CheckboxProps> = ({ id, checked, onChange, label, description }) => {
    return (
        <div className="flex items-center">
            {/* The actual checkbox */}
            <input
                type="checkbox"
                id={id}
                className="peer hidden"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />

            {/* Label as custom styled checkbox */}
            <label
                htmlFor={id}
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
            </label>

            {/* Label and description */}
            <label className="ml-3 block text-sm font-medium text-gray-700">
                {label}
                <span className="text-sm text-gray-500">{description}</span>
            </label>
        </div>
    );
};

export default FuseCheckbox;
