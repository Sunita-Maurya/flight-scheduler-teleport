import React, { useState } from "react";

const Switch = ({ status, onChange }) => {
  console.log("status", status);
  const handleToggle = (e) => {
    console.log(e.target.checked);
    onChange && onChange(!status);
  };

  return (
    // <div className="flex items-center gap-3">
    //   <button
    //     onClick={handleToggle}
    //     className={`relative inline-flex h-4 w-11 items-center rounded-full transition-colors ${
    //       status ? "bg-green-500" : "bg-gray-300"
    //     }`}
    //   >
    //     <span
    //       className={`inline-block h-4 w-4 border border-gray-200 transform rounded-full bg-white transition-transform ${
    //         status ? "translate-x-7" : "translate-x-1"
    //       }`}
    //     />
    //   </button>
    // </div>
    <label
      className={`inline-flex items-center cursor-pointer rounded-2xl border border-blue-400 ${status ? "bg-blue-400" : "bg-gray-300"}`}
    >
      <input
        type="checkbox"
        checked={status}
        className="sr-only peer border-0 outline-0"
        onChange={handleToggle}
      />
      <div className="relative w-9 h-5 bg-neutral-quaternary peer-focus:outline-none  peer-focus:ring-brand-soft dark:peer-focus:ring-brand-soft rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
    </label>
  );
};

export default Switch;
