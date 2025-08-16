import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../context/GlobalContext";

const GenericModal = () => {
    const { modalState, setModalState } = useContext(GlobalContext);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (modalState.showModal) {
            setIsAnimating(true);
        } else {
            // Delay to match the exit animation duration (500ms for transform, 300ms for opacity)
            // Use the longer duration to ensure the content is still mounted during exit animation
            setTimeout(() => setIsAnimating(false), 500);
        }
    }, [modalState.showModal]);

    const handleClose = () => {
        setModalState({ ...modalState, showModal: false });
    };

    // Function to determine the max-width class based on size prop
    const getModalSizeClass = (size: string) => {
        switch (size) {
            case "sm":
                return "max-w-sm";
            case "lg":
                return "max-w-3xl"; // A common large size for modals
            case "xl": // Optional: Add an extra large size
                return "max-w-5xl";
            case "full": // Optional: Full width but with padding
                return "max-w-full mx-4 sm:mx-8"; // Adjust mx- values as needed
            case "md":
            default:
                return "max-w-lg"; // Default medium size
        }
    };

    const modalSizeClass = getModalSizeClass(modalState.size!);

    return (
        <>
            {/* Only render modal backdrop when animating or visible */}
            {(modalState.showModal || isAnimating) && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50
                                transition-opacity duration-300 ease-out
                                ${modalState.showModal ? "opacity-100" : "opacity-0"}`}
                    onClick={handleClose} // Close modal when clicking on backdrop
                >
                    <div
                        className={`bg-white w-full ${modalSizeClass} mx-4 rounded-lg shadow-lg transform transition-all duration-500 ease-out
                                   ${modalState.showModal ? "scale-100 rotate-0 opacity-100" : "scale-90 opacity-0 "}`}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
                    >
                        <div className="px-4 py-3 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {modalState.title}
                            </h2>
                        </div>
                        <div className="p-4 text-gray-700">{modalState.body}</div>
                        <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
                            {modalState.footer ? (
                                modalState.footer
                            ) : (
                                <button
                                    onClick={handleClose}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    Ok
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GenericModal;