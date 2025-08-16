import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FaCaretDown } from "react-icons/fa6";

interface FuseComboboxProps<T> {
  items: T[];
  selectedItem: T | null;
  onItemSelect: (item: T) => void;
  // Modified labelKey to be a union type
  labelKey: keyof T | ((item: T) => React.ReactNode);
  valueKey: keyof T;
  placeholder?: string;
  onQueryChange?: (query: string) => void;
  onSaveQuery?: (query: string) => void;
  getSearchableString?: (item: T) => string;
  resetFilterOnCaretClick?: boolean; // New prop to control reset behavior
}

const FuseCombobox = <T,>({
  items,
  selectedItem,
  onItemSelect,
  labelKey,
  valueKey,
  placeholder = "Select an item",
  onQueryChange,
  onSaveQuery,
  getSearchableString, // Destructure the new prop
  resetFilterOnCaretClick = true,
}: FuseComboboxProps<T>) => {
  const [query, setQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);
  const [resetInput, setResetInput] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);

  // Helper function to extract text content from a ReactNode.
  // This is crucial for making the displayValue and search work with JSX labels.
  const extractTextFromReactNode = (node: React.ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') {
      return String(node);
    }
    // If it's a React element, we need to inspect its children.
    // This is a simplified approach; for very complex nested structures,
    // you might need a more sophisticated traversal or to enforce `getSearchableString`.
    if (React.isValidElement(node) && node.props && node.props.children) {
      // Recursively extract text from children
      if (Array.isArray(node.props.children)) {
        return node.props.children.map(extractTextFromReactNode).join(' ');
      } else {
        return extractTextFromReactNode(node.props.children);
      }
    }
    return ''; // Fallback for other types or empty nodes
  };

  // Helper function to get the string used for the ComboboxInput display and for filtering
  const getItemDisplayAndSearchString = (item: T): string => {
    if (item === null || item === undefined) return "";
    
    // Priority 1: If getSearchableString is provided, use it for both display and search
    if (getSearchableString) {
      return getSearchableString(item);
    }
    
    // Priority 2: If labelKey is a function, we try to extract text from its ReactNode output.
    // This ensures the input displays the actual label content, not the ID.
    if (typeof labelKey === "function") {
      const renderedLabel = labelKey(item);
      return extractTextFromReactNode(renderedLabel);
    } else {
      // Priority 3: If labelKey is a string (keyof T), use the property value
      return String(item[labelKey]);
    }
  };

  // Helper function to get the actual ReactNode for rendering in options
  const getItemRenderableLabel = (item: T): React.ReactNode => {
    if (typeof labelKey === "function") {
      // If labelKey is a function, return its direct output (can be JSX)
      return labelKey(item);
    } else {
      // If labelKey is a string (keyof T), return the property value as a string
      return String(item[labelKey]);
    }
  };

  useEffect(() => {
    if (onQueryChange) {
      onQueryChange(query);
    }

    const fItems = !query
      ? items
      : items.filter((item) => {
          // Always use the robust string for filtering
          const itemLabel = getItemDisplayAndSearchString(item);
          return itemLabel.toLowerCase().includes(query.toLowerCase());
        });

    setFilteredItems(fItems);
  }, [query, onQueryChange, items, labelKey, getSearchableString]); // Add new prop to dependencies

  useEffect(() => {
    // This effect ensures the input clears when selectedItem becomes null
    // It also resets the internal query to match the selected item's display
    if (selectedItem === null) {
      setResetInput((prev) => !prev);
      setQuery(""); // Clear query when no item is selected
    } else {
      // When an item is selected, set the query to match its display string
      setQuery(getItemDisplayAndSearchString(selectedItem));
    }
  }, [selectedItem]); // Only depend on selectedItem for this effect

  const updateDropdownPosition = () => {
    requestAnimationFrame(() => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    });
  };

  const handleFocus = () => {
    // When the combobox gains focus, if there's a query but no item selected, clear the query
    // to show all options, enhancing user experience for re-selection.
    // If an item *is* selected, the query should already match its display value from the useEffect above.
    if (query && !selectedItem) { // Only reset query if no item is selected      
      setQuery("");
    }

    updateDropdownPosition();
  };

  useEffect(() => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    portalContainerRef.current = div;
    return () => {
      if (portalContainerRef.current) {
        document.body.removeChild(portalContainerRef.current);
      }
    };
  }, []);

  const optionsElement = (
    <ComboboxOptions
      style={{
        position: "absolute",
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        zIndex: 9999,
        maxHeight: "500px", 
        overflowY: "auto",
      }}
      className="bg-white border border-gray-300 rounded-md shadow-lg focus:outline-none"
    >
      {filteredItems.length > 0 ? (
        filteredItems.map((item) => (
          <ComboboxOption
            key={String(item[valueKey])}
            value={item}
            className={({ active }) =>
              `cursor-pointer select-none relative py-2 pl-4 pr-4 ${
                active ? "text-white bg-primary" : "text-gray-900 dark:text-white"
              }`
            }
          >
            {/* Use getItemRenderableLabel for rendering options, supporting JSX */}
            {getItemRenderableLabel(item)}
          </ComboboxOption>
        ))
      ) : (
        <div className="p-4 text-center">
          <p className="text-gray-700 dark:text-gray-200 mb-2">No results found</p>
          {onSaveQuery && query && (
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary2"
              onClick={() => onSaveQuery(query)}
            >
              Save "{query}"
            </button>
          )}
        </div>
      )}
    </ComboboxOptions>
  );

  return (
    <Combobox value={selectedItem} onChange={onItemSelect}>
      <div ref={wrapperRef} className="relative inline-block text-left w-full">
        <ComboboxInput
          // Using key to force re-render and clear input when resetInput toggles
          key={resetInput.toString()}
          className="w-full p-2 border dark:bg-gray-800 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary2"
          // Use getItemDisplayAndSearchString for the input's display value
          displayValue={(item: T) => getItemDisplayAndSearchString(item)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          onFocus={handleFocus}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2" onClick={() => resetFilterOnCaretClick && setQuery("")}>
          <FaCaretDown className="text-primary" size={20} />
        </ComboboxButton>
      </div>
      {portalContainerRef.current && ReactDOM.createPortal(optionsElement, portalContainerRef.current)}
    </Combobox>
  );
};

export default FuseCombobox;