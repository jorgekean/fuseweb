import { useEffect, useState } from "react";

const ModalFooterWithDropdown = ({ timeOptions, saveReminderTime, setModalState, modalState }) => {
    const [selectedOption, setSelectedOption] = useState("");
   
    // Initialize selectedOption, perhaps with a default or the first option
    useEffect(() => {
      if (timeOptions && timeOptions.length > 0) {
        setSelectedOption(String(timeOptions[0])); // Set first option as default or a preferred default
      }
    }, [timeOptions]);
   
   
    const handleChange = (value) => {
      setSelectedOption(value);
      console.log("Selected value in footer component:", value);
    };
   
    return (
      <div className="flex flex-col sm:flex-row justify-end items-center sm:space-x-2 space-y-2 sm:space-y-0">
        <label htmlFor="reminder-select" className="mb-1 text-sm font-medium text-gray-700">
          Remind me in
        </label>
        <select
          id="reminder-select"
          value={selectedOption}
          onChange={(e) => handleChange(e.target.value)}
          className="block w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-md"
        >
          <option value="" disabled>
            Select an option
          </option>
          {timeOptions.map((option, index) => (
            <option key={index} value={option}>
              {option === 30 ? `${option} minutes` : 
              option === 60 ? `${option / 60} hour`
            : `${option / 60} hours`}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setModalState({ ...modalState, showModal: false });
            saveReminderTime(Number(selectedOption));
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-md focus:outline-none focus:ring-2 hover:bg-opacity-80 transition ease-in-out duration-150 rounded-md"
          style={{
            backgroundColor: "purple",
            color: "white",
          }}
        >
          Okay
        </button>
        <button
          type="button"
          onClick={() => {
            setModalState({ ...modalState, showModal: false });
            localStorage.setItem("lastReminderDate", new Date().toLocaleDateString());
            localStorage.removeItem("scheduledReminderTime"); // Clear the schedule
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-md focus:outline-none focus:ring-2 hover:bg-opacity-80 transition ease-in-out duration-150 rounded-md"
          style={{
            backgroundColor: "gray",
            color: "white",
          }}
        >
          Dismiss
        </button>
      </div>
    );
  }

  export default ModalFooterWithDropdown;