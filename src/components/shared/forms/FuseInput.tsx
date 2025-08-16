import React from 'react';

interface FuseInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    name?: string;
}

const FuseInput: React.FC<FuseInputProps> = ({ value, onChange, placeholder = '', type = 'text', name }) => {
    return (
        <input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete='off'
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary2 dark:bg-gray-800"
        />
    );
};

export default FuseInput;
