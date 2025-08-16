import React from 'react';

interface FuseTextAreaProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
    name?: string;
}

const FuseTextArea: React.FC<FuseTextAreaProps> = ({ value, onChange, placeholder = '', rows = 1, name }) => {
    return (
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary2 dark:bg-gray-800"
        />
    );
};

export default FuseTextArea;
