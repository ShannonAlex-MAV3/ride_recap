import React from "react";
import Select, { ActionMeta, MultiValue, Props, StylesConfig } from "react-select";
import { cn } from "../../lib/utils";

export type OptionType = {
  label: string;
  value: string | number;
};

interface SearchableSelectProps extends Omit<Props<OptionType, boolean>, "onChange"> {
  options: OptionType[];
  value?: OptionType | OptionType[] | null;
  onChange?: (value: OptionType | OptionType[] | null, actionMeta: ActionMeta<OptionType>) => void;
  isMulti?: boolean;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  className?: string;
  menuPlacement?: "auto" | "bottom" | "top";
  noOptionsMessage?: () => string;
  closeMenuOnSelect?: boolean;
  controlHeight?: string | number;
}

const getCustomStyles = (controlHeight?: string | number): StylesConfig<OptionType, boolean> => ({
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 8px",
    minHeight: controlHeight || "36px",
    maxHeight: controlHeight || "36px",
    overflow: "hidden",
  }),
  control: (provided, state) => ({
    ...provided,
    borderRadius: "0.375rem",
    borderColor: state.isFocused ? "#2563eb" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#2563eb" : "#d1d5db",
    },
    backgroundColor: state.isDisabled ? "#f3f4f6" : "#fff",
    fontSize: "0.875rem",
    minHeight: "36px",
    height: "36px",
    padding: "0",
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "0.375rem",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "0.875rem",
    backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? "#e5e7eb" : "transparent",
    color: state.isSelected ? "#fff" : "#374151",
    cursor: "pointer",
    ":active": {
      backgroundColor: state.isSelected ? "#2563eb" : "#e5e7eb",
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#e5e7eb",
    borderRadius: "0.25rem",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "#374151",
    padding: "2px 6px",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: "#6b7280",
    ":hover": {
      backgroundColor: "#d1d5db",
      color: "#1f2937",
    },
  }),
});

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  isMulti = false,
  placeholder = "Select...",
  isSearchable = true,
  isClearable = true,
  isDisabled = false,
  className = "",
  menuPlacement = "auto",
  noOptionsMessage = () => "No options available",
  closeMenuOnSelect = !isMulti,
  controlHeight,
  ...props
}) => {
  const handleChange = (newValue: MultiValue<OptionType> | OptionType | null, actionMeta: ActionMeta<OptionType>) => {
    if (onChange) {
      // Cast to appropriate type for the onChange handler
      const valueToPass = Array.isArray(newValue) ? (newValue as OptionType[]) : (newValue as OptionType | null);
      onChange(valueToPass, actionMeta);
    }
  };

  return (
    <Select
      options={options}
      value={value}
      onChange={handleChange}
      isMulti={isMulti}
      placeholder={placeholder}
      isSearchable={isSearchable}
      isClearable={isClearable}
      isDisabled={isDisabled}
      menuPlacement={menuPlacement}
      styles={getCustomStyles(controlHeight)}
      noOptionsMessage={noOptionsMessage}
      closeMenuOnSelect={closeMenuOnSelect}
      className={cn("react-select", className)}
      classNamePrefix="react-select"
      {...props}
    />
  );
};

export default SearchableSelect;
