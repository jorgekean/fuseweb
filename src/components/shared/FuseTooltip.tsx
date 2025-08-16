import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
    content: string;
    children: ReactNode;
    className?: string;
    tooltipClassName?: string;
    isTopFull?: boolean; // Optional prop to control tooltip position
    disabled?: boolean;   // <-- New optional prop
}

const FuseTooltip: React.FC<TooltipProps> = ({
    content,
    children,
    className = '',
    tooltipClassName = '',
    isTopFull = true,
    disabled = false,    // default to false
}) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (disabled) return; // Skip event listeners if disabled

        const handleOutsideClick = (event: MouseEvent) => {
            if (
                tooltipRef.current &&
                !tooltipRef.current.contains(event.target as Node) &&
                !(children as any).ref?.current?.contains(event.target as Node)
            ) {
                setIsHovered(false);
            }
        };

        if (isHovered) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isHovered, children, disabled]);

    // If disabled, do not respond to hover events and do not show tooltip
    return (
        <div
            className={`relative inline-flex justify-center items-center ${className} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onMouseEnter={() => !disabled && setIsHovered(true)}
            onMouseLeave={() => !disabled && setIsHovered(false)}
            ref={tooltipRef}
            aria-disabled={disabled}
        >
            {children}
            {!disabled && isHovered && (
                <span
                    className={`absolute ${isTopFull ? 'top-full' : 'bottom-full'} mb-2 left-1/2 
                        transform -translate-x-1/2 px-2 py-1 bg-primary 
                        text-white text-xs rounded opacity-100 
                        transition-opacity duration-200 pointer-events-none
                        whitespace-nowrap ${tooltipClassName}`}
                >
                    {content}
                </span>
            )}
        </div>
    );
};

export default FuseTooltip;
