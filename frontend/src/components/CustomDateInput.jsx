import React, { useState, useEffect, useRef } from "react";
import { formatDate } from "../lib/dateUtils";
import { useLanguage } from "../lib/LanguageContext";

const CustomDateInput = ({
  value,
  onChange,
  name = "dueDate",
  placeholder = "DD/MM/YYYY",
  className = "form-control rounded-lg text-sm py-2",
  disabled = false,
  required = false,
}) => {
  const { language } = useLanguage();
  const dateInputRef = useRef(null);
  const [inputText, setInputText] = useState("");

  // Keep display text synchronized with incoming YYYY-MM-DD value
  useEffect(() => {
    if (value) {
      setInputText(formatDate(value, language));
    } else {
      setInputText("");
    }
  }, [value, language]);

  // Handle direct typing in DD/MM/YYYY format
  const handleTextChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    const match = val.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const day = match[1].padStart(2, "0");
      const month = match[2].padStart(2, "0");
      let yearNum = parseInt(match[3], 10);
      if (yearNum > 2400) yearNum -= 543;

      const isoStr = `${yearNum}-${month}-${day}`;
      const testDate = new Date(`${yearNum}-${month}-${day}T00:00:00`);
      if (!isNaN(testDate.getTime())) {
        onChange({ target: { name, value: isoStr } });
      }
    } else if (!val.trim()) {
      onChange({ target: { name, value: "" } });
    }
  };

  // Handle visual calendar picker selection
  const handlePickerChange = (e) => {
    const pickedIso = e.target.value;
    onChange({ target: { name, value: pickedIso } });
  };

  const openCalendar = () => {
    if (disabled) return;
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        try {
          dateInputRef.current.showPicker();
        } catch (err) {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div className="position-relative w-100 d-flex align-items-center">
      <input
        type="text"
        className={className}
        value={inputText}
        onChange={handleTextChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={{ paddingRight: "2.5rem" }}
      />
      <button
        type="button"
        className="btn btn-link p-0 position-absolute end-0 me-2 text-decoration-none border-0 bg-transparent text-muted"
        onClick={openCalendar}
        disabled={disabled}
        title="Choose Date"
        style={{ zIndex: 3, display: "flex", alignItems: "center" }}
      >
        <ion-icon name="calendar-outline" style={{ fontSize: "18px", color: "#64748b" }}></ion-icon>
      </button>
      <input
        ref={dateInputRef}
        type="date"
        name={name}
        value={value || ""}
        onChange={handlePickerChange}
        disabled={disabled}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default CustomDateInput;
