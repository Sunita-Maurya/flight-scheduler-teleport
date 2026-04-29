import React from "react";

const DropDown = ({
  options,
  value,
  onChange,
  placeholder = "Select option",
  name,
  className,
}) => {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e)}
      name={name}
      className={className}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
  );
};

export default DropDown;
