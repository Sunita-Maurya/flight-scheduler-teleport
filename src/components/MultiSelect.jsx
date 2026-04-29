import { useState, useRef, useEffect } from "react";

const options = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function MultiSelect({ selected, name, onChange }) {
  // const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const selectedDaysLabel = selected
    .map((dayNum) => options[dayNum - 1])
    .join(",");

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const newSelected = selected.includes(option)
      ? selected.filter((i) => i !== option)
      : [...selected, option];

    onChange(name, newSelected);
  };

  return (
    <div className="w-40 relative" ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        className="border rounded px-3 h-8 flex items-center cursor-pointer"
      >
        <span className="truncate text-sm text-gray-700">
          {selected.length === 0 ? "Select days" : selectedDaysLabel}
        </span>
      </div>

      {/*  Dropdown */}
      {open && (
        <div className="absolute w-full bg-white border rounded-lg mt-1 shadow max-h-60 overflow-y-auto z-10">
          {options.map((option, i) => (
            <label
              key={option}
              className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={selected.includes(i + 1)}
                onChange={() => toggleOption(i + 1)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
