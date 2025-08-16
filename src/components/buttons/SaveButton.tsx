import { ReactNode } from 'react';

interface SaveButtonProps {
    icon: ReactNode;
    label: string;
    onClick?: () => void;
}

export default function SaveButton({ icon, label, onClick }: SaveButtonProps) {
    return (
        <button
            type={onClick ? 'button' : 'submit'}
            onClick={onClick}
            className="
        inline-flex items-center justify-center gap-2 
        px-4 py-3 
        text-sm 
        font-semibold tracking-wide text-white 
        transition-all duration-150 ease-in-out 
        bg-gradient-to-r from-primary2 to-primary 
        rounded-lg shadow-lg 
        hover:opacity-90
        focus:outline-none focus:ring-2 focus:ring-primary2 focus:ring-offset-2 
        active:scale-95
      "
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
