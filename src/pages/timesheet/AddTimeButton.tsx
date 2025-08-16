import React, {
    useState,
    forwardRef,
    useImperativeHandle,
    useRef,
    useEffect,
} from 'react';
import ReactDOM from 'react-dom';
import { TimesheetData } from '../../models/Timesheet';
import { TimesheetService } from './TimesheetService';
import FuseTooltip from '../../components/shared/FuseTooltip';
import { FaClock } from 'react-icons/fa';
import { set } from 'lodash';

interface AddTimeButtonProps {
    formData: TimesheetData;
    setFormData?: React.Dispatch<React.SetStateAction<TimesheetData>>;
    durationStr?: string;
    setDurationStr?: React.Dispatch<React.SetStateAction<string>>;
    inputRef?: React.RefObject<HTMLInputElement>;
    // updateData?: (id: number | string, columnId: string, value: any) => void;
}

export type AddTimeButtonRef = {
    openDropdown: () => void;
    closeDropdown: () => void;
};

const AddTimeButton = forwardRef<AddTimeButtonRef, AddTimeButtonProps>(
    ({ formData, setFormData, durationStr, setDurationStr, inputRef }, ref) => {
        const timesheetService = TimesheetService();
        const [isOpen, setIsOpen] = useState(false);
        const containerRef = useRef<HTMLDivElement>(null);
        const dropdownRef = useRef<HTMLDivElement>(null); // New ref for the dropdown container
        const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

        const toggleDropdown = () => {
            setIsOpen((prev) => !prev);
        };

        const closeDropdown = () => setIsOpen(false);
        const openDropdown = () => setIsOpen(true);

        useImperativeHandle(ref, () => ({
            openDropdown,
            closeDropdown,
        }));

        useEffect(() => {
            if (isOpen && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                });
            }
        }, [isOpen]);

        // ✅ Corrected outside click handler with a ref for the dropdown portal
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(event.target as Node) &&
                    dropdownRef.current &&
                    !dropdownRef.current.contains(event.target as Node)
                ) {
                    closeDropdown();
                }
            };

            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside);
            } else {
                document.removeEventListener('mousedown', handleClickOutside);
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [isOpen]);

        const resetTime = () => {
            handleDurationChangeText('00:00:00');
            closeDropdown();

            if (inputRef && inputRef.current) {
                inputRef.current.focus(); // Focus the input after updating
            }
        };

        const convertToSeconds = (time: string): number => {
            const [hours, minutes, seconds] = time.split(':').map(Number);
            return hours * 3600 + minutes * 60 + seconds;
        };

        const handleDurationChangeText = (value: string) => {
            if (setFormData) {
                setFormData((prevState) => ({
                    ...prevState,
                    durationStr: value,
                    duration: convertToSeconds(value),
                }));
            }
            if (setDurationStr) {
                setDurationStr(value);
            }
        };

        const handleDurationChangeFromDropdown = (delta: number) => {
            let dataToUse = durationStr || formData.durationStr || '00:00:00';
            if (!timesheetService.isValidTimeFormat(dataToUse)) {
                dataToUse = '00:00:00';
            }

            const currentSeconds = timesheetService.timeToSeconds(dataToUse);
            let newSeconds = currentSeconds + delta;
            if (newSeconds < 0) newSeconds = 0;

            handleDurationChangeText(timesheetService.secondsToTime(newSeconds));
            closeDropdown();

            if (inputRef && inputRef.current) {
                inputRef.current.focus(); // Focus the input after updating
            }
        };

        const dropdownContent = (
            <div
                ref={dropdownRef} // Attach the new ref here
                style={{
                    position: 'absolute',
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                }}
                className="z-50 w-40 mt-2 origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="dropdown-button"
            >
                <ul className="py-1">
                    {[
                        ['Reset Time', resetTime],
                        ['+5 mins', () => handleDurationChangeFromDropdown(300)],
                        ['+15 mins', () => handleDurationChangeFromDropdown(900)],
                        ['+30 mins', () => handleDurationChangeFromDropdown(1800)],
                        ['+1 hour', () => handleDurationChangeFromDropdown(3600)],
                        ['-5 mins', () => handleDurationChangeFromDropdown(-300)],
                        ['-15 mins', () => handleDurationChangeFromDropdown(-900)],
                        ['-30 mins', () => handleDurationChangeFromDropdown(-1800)],
                        ['-1 hour', () => handleDurationChangeFromDropdown(-3600)],
                    ].map(([label, onClick], index) => (
                        <li key={index}>
                            <button
                                className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                onClick={onClick}
                            >
                                {label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );

        return (
            <FuseTooltip content="Add Time" isTopFull={false}>
                <div ref={containerRef} className="relative inline-block text-left">
                    <button
                        type="button"
                        data-clock-button
                        onClick={toggleDropdown}
                        className="ml-2 flex items-center justify-center w-10 h-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary2 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                    >
                        <FaClock className="text-primary" size={18} />
                    </button>
                    {isOpen && ReactDOM.createPortal(dropdownContent, document.body)}
                </div>
            </FuseTooltip>
        );
    }
);

AddTimeButton.displayName = 'AddTimeButton';
export default AddTimeButton;