import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Popover,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Parse YYYY-MM-DD string as local date (avoid UTC shift)
function parseLocalDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Format Date object to YYYY-MM-DD
function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Format for display: DD/MM/YYYY
function toDisplay(str) {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}

function DatePickerField({
  label,
  value, // YYYY-MM-DD string
  onChange, // (yyyymmdd: string) => void
  required,
  disabled,
  helperText,
  fullWidth = true,
  minDate, // YYYY-MM-DD string
  maxDate, // YYYY-MM-DD string
  size,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const selectedDate = parseLocalDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDateObj = parseLocalDate(minDate);
  const maxDateObj = parseLocalDate(maxDate);

  // Calendar display month/year
  const [viewDate, setViewDate] = useState(() => {
    const d = selectedDate || new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Build calendar grid (42 cells = 6 rows × 7 cols)
  const calendarCells = () => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    const cells = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, current: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, current: true });
    }
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, current: false });
    }
    return cells;
  };

  const cells = calendarCells();

  const handleDayClick = (cell) => {
    if (!cell.current) return;
    const picked = new Date(viewYear, viewMonth, cell.day);
    picked.setHours(0, 0, 0, 0);
    if (minDateObj && picked < minDateObj) return;
    if (maxDateObj && picked > maxDateObj) return;
    onChange(toYMD(picked));
    setOpen(false);
  };

  const prevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));

  const isSelected = (cell) => {
    if (!cell.current || !selectedDate) return false;
    return (
      selectedDate.getDate() === cell.day &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
    );
  };

  const isToday = (cell) => {
    if (!cell.current) return false;
    return (
      today.getDate() === cell.day &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear
    );
  };

  const isDisabled = (cell) => {
    if (!cell.current) return true;
    const d = new Date(viewYear, viewMonth, cell.day);
    if (minDateObj && d < minDateObj) return true;
    if (maxDateObj && d > maxDateObj) return true;
    return false;
  };

  const popoverBg = isDark ? "#1e293b" : "#ffffff";
  const headerBg = isDark
    ? "linear-gradient(135deg, #6d28d9, #db2777)"
    : "linear-gradient(135deg, #7c3aed, #ec4899)";
  const cellHover = isDark ? "rgba(167,139,250,0.15)" : "#ede9fe";
  const todayBorder = isDark ? "#a78bfa" : "#7c3aed";
  const selectedBg = isDark
    ? "linear-gradient(135deg, #7c3aed, #ec4899)"
    : "linear-gradient(135deg, #7c3aed, #ec4899)";

  return (
    <>
      <TextField
        ref={anchorRef}
        label={label}
        value={toDisplay(value)}
        placeholder="DD/MM/YYYY"
        fullWidth={fullWidth}
        required={required}
        disabled={disabled}
        helperText={helperText}
        size={size}
        onClick={() => !disabled && setOpen(true)}
        onChange={() => {}} // controlled
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) setOpen(true);
                }}
                sx={{ color: isDark ? "#a78bfa" : "#7c3aed" }}
              >
                <CalendarIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          sx: { cursor: disabled ? "default" : "pointer" },
        }}
        InputLabelProps={{ shrink: !!value }}
        sx={{
          "& .MuiOutlinedInput-root": {
            cursor: disabled ? "default" : "pointer",
          },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: popoverBg,
            boxShadow: isDark
              ? "0 20px 60px rgba(0,0,0,0.6)"
              : "0 20px 60px rgba(0,0,0,0.15)",
            width: 320,
            border: isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.08)",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: headerBg,
            px: 2,
            py: 2,
          }}
        >
          {/* Selected date display */}
          <Typography
            sx={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              mb: 0.25,
            }}
          >
            {label || "Select Date"}
          </Typography>
          <Typography
            sx={{
              color: "white",
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            {selectedDate
              ? selectedDate.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </Typography>
        </Box>

        {/* Month Navigator */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1.5,
            py: 1,
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
          }}
        >
          <IconButton
            size="small"
            onClick={prevMonth}
            sx={{ color: isDark ? "#a78bfa" : "#7c3aed" }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              background: isDark
                ? "linear-gradient(135deg, #a78bfa, #f472b6)"
                : "linear-gradient(135deg, #7c3aed, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Typography>
          <IconButton
            size="small"
            onClick={nextMonth}
            sx={{ color: isDark ? "#a78bfa" : "#7c3aed" }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Day Names */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            px: 1.5,
            pt: 1,
            pb: 0.5,
          }}
        >
          {DAY_NAMES.map((d, i) => (
            <Typography
              key={d}
              sx={{
                textAlign: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
                color:
                  i === 0
                    ? "#ef4444"
                    : isDark
                      ? "rgba(255,255,255,0.4)"
                      : "rgba(0,0,0,0.4)",
                textTransform: "uppercase",
                py: 0.5,
              }}
            >
              {d}
            </Typography>
          ))}
        </Box>

        {/* Calendar Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            px: 1.5,
            pb: 1.5,
            gap: 0.25,
          }}
        >
          {cells.map((cell, idx) => {
            const sel = isSelected(cell);
            const tod = isToday(cell);
            const dis = isDisabled(cell);
            const isSun = idx % 7 === 0;
            return (
              <Box
                key={idx}
                onClick={() => !dis && handleDayClick(cell)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  cursor: dis ? "default" : "pointer",
                  position: "relative",
                  ...(sel && {
                    background: selectedBg,
                    boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
                  }),
                  ...(tod &&
                    !sel && {
                      border: `2px solid ${todayBorder}`,
                    }),
                  ...(!sel &&
                    !dis && {
                      "&:hover": {
                        bgcolor: cellHover,
                      },
                    }),
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    fontWeight: sel ? 700 : tod ? 700 : 400,
                    color: sel
                      ? "white"
                      : dis
                        ? isDark
                          ? "rgba(255,255,255,0.18)"
                          : "rgba(0,0,0,0.2)"
                        : tod
                          ? isDark
                            ? "#a78bfa"
                            : "#7c3aed"
                          : isSun && cell.current
                            ? "#ef4444"
                            : isDark
                              ? "rgba(255,255,255,0.85)"
                              : "rgba(0,0,0,0.8)",
                    lineHeight: 1,
                  }}
                >
                  {cell.day}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Footer: Today button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 2,
            pb: 1.5,
            pt: 0.5,
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
          }}
        >
          <Typography
            onClick={() => {
              const tStr = toYMD(today);
              const minOk = !minDateObj || today >= minDateObj;
              const maxOk = !maxDateObj || today <= maxDateObj;
              if (minOk && maxOk) {
                onChange(tStr);
                setOpen(false);
              }
            }}
            sx={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: isDark ? "#a78bfa" : "#7c3aed",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Today
          </Typography>
          <Typography
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            sx={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "text.secondary",
              cursor: "pointer",
              "&:hover": { color: "#ef4444" },
            }}
          >
            Clear
          </Typography>
        </Box>
      </Popover>
    </>
  );
}

export default DatePickerField;
