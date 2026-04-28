import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Divider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Event as EventIcon,
  Circle as CircleIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Groups as GuestsIcon,
} from "@mui/icons-material";

const STATUS_COLORS = {
  draft: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e", dot: "#f59e0b" },
  confirmed: {
    bg: "#dbeafe",
    border: "#3b82f6",
    text: "#1e40af",
    dot: "#3b82f6",
  },
  completed: {
    bg: "#d1fae5",
    border: "#10b981",
    text: "#065f46",
    dot: "#10b981",
  },
  cancelled: {
    bg: "#fee2e2",
    border: "#ef4444",
    text: "#991b1b",
    dot: "#ef4444",
  },
};

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

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

// Returns YYYY-MM-DD using local timezone (avoids UTC shift)
const toLocalDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

function BookingCalendar({ bookings = [], onBookingClick }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [view, setView] = useState("month"); // "month" | "year"

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Group bookings by event date
  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach((booking) => {
      const eventDate = booking.eventDetails?.eventDate;
      if (!eventDate) return;
      const dateKey = toLocalDateKey(new Date(eventDate));
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(booking);
    });
    return map;
  }, [bookings]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Previous month days for padding
    const prevMonth = new Date(currentYear, currentMonth, 0);
    const prevMonthDays = prevMonth.getDate();

    const days = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, prevMonthDays - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, i),
      });
    }

    // Next month padding
    const remaining = 42 - days.length; // 6 rows x 7 cols
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, i),
      });
    }

    return days;
  }, [currentMonth, currentYear]);

  // Stats for current month
  const monthStats = useMemo(() => {
    const stats = {
      total: 0,
      draft: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    calendarDays.forEach(({ date, isCurrentMonth }) => {
      if (!isCurrentMonth) return;
      const dateKey = toLocalDateKey(date);
      const dayBookings = bookingsByDate[dateKey] || [];
      stats.total += dayBookings.length;
      dayBookings.forEach((b) => {
        if (stats[b.status] !== undefined) stats[b.status]++;
      });
    });
    return stats;
  }, [calendarDays, bookingsByDate]);

  // Stats per month for year view
  const yearStats = useMemo(() => {
    const stats = Array.from({ length: 12 }, () => ({
      total: 0,
      draft: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    }));
    bookings.forEach((booking) => {
      const eventDate = booking.eventDetails?.eventDate;
      if (!eventDate) return;
      const d = new Date(eventDate);
      if (d.getFullYear() !== currentYear) return;
      const m = d.getMonth();
      stats[m].total++;
      if (stats[m][booking.status] !== undefined) stats[m][booking.status]++;
    });
    return stats;
  }, [bookings, currentYear]);

  const today = new Date();
  const todayKey = toLocalDateKey(today);

  const goToPrevMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const goToNextMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handlePrev = () => {
    if (view === "month") goToPrevMonth();
    else setCurrentDate(new Date(currentYear - 1, currentMonth, 1));
  };
  const handleNext = () => {
    if (view === "month") goToNextMonth();
    else setCurrentDate(new Date(currentYear + 1, currentMonth, 1));
  };

  const handleDayClick = (dayData) => {
    const dateKey = toLocalDateKey(dayData.date);
    const dayBookings = bookingsByDate[dateKey] || [];
    if (dayBookings.length > 0) {
      setSelectedDate({ date: dayData.date, bookings: dayBookings });
      setDialogOpen(true);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box>
      {/* Calendar Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handlePrev}
            size={isMobile ? "small" : "medium"}
            sx={{
              bgcolor: isDark ? "rgba(255,255,255,0.08)" : "grey.200",
              color: isDark ? "grey.300" : "grey.700",
              border: "1px solid",
              borderColor: isDark ? "rgba(255,255,255,0.15)" : "grey.400",
              "&:hover": {
                bgcolor: isDark ? "rgba(255,255,255,0.16)" : "grey.300",
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              fontWeight: 700,
              minWidth: isMobile ? 120 : 200,
              textAlign: "center",
              background: isDark
                ? "linear-gradient(135deg, #a78bfa, #f472b6)"
                : "linear-gradient(135deg, #7c3aed, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {view === "month"
              ? `${MONTH_NAMES[currentMonth]} ${currentYear}`
              : currentYear}
          </Typography>
          <IconButton
            onClick={handleNext}
            size={isMobile ? "small" : "medium"}
            sx={{
              bgcolor: isDark ? "rgba(255,255,255,0.08)" : "grey.200",
              color: isDark ? "grey.300" : "grey.700",
              border: "1px solid",
              borderColor: isDark ? "rgba(255,255,255,0.15)" : "grey.400",
              "&:hover": {
                bgcolor: isDark ? "rgba(255,255,255,0.16)" : "grey.300",
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<TodayIcon />}
            onClick={goToToday}
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {isMobile ? "" : "Today"}
          </Button>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, v) => v && setView(v)}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
                px: 1.5,
                borderColor: isDark ? "rgba(255,255,255,0.2)" : "grey.400",
                color: isDark ? "grey.400" : "grey.600",
                "&.Mui-selected": {
                  bgcolor: isDark ? "rgba(167,139,250,0.2)" : "#ede9fe",
                  color: isDark ? "#a78bfa" : "#7c3aed",
                  borderColor: isDark ? "#a78bfa" : "#7c3aed",
                  "&:hover": {
                    bgcolor: isDark ? "rgba(167,139,250,0.3)" : "#ddd6fe",
                  },
                },
              },
            }}
          >
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="year">Year</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      {/* Month Stats */}
      {view === "month" && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: 2.5,
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={`${monthStats.total} Events`}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: isDark ? "rgba(124,58,237,0.2)" : "#f3e8ff",
              color: isDark ? "#a78bfa" : "#7c3aed",
              fontSize: "0.75rem",
            }}
          />
          {monthStats.confirmed > 0 && (
            <Chip
              icon={
                <CircleIcon
                  sx={{
                    fontSize: "8px !important",
                    color: "#3b82f6 !important",
                  }}
                />
              }
              label={`${monthStats.confirmed} Confirmed`}
              size="small"
              sx={{ fontWeight: 500, fontSize: "0.7rem" }}
              variant="outlined"
            />
          )}
          {monthStats.draft > 0 && (
            <Chip
              icon={
                <CircleIcon
                  sx={{
                    fontSize: "8px !important",
                    color: "#f59e0b !important",
                  }}
                />
              }
              label={`${monthStats.draft} Draft`}
              size="small"
              sx={{ fontWeight: 500, fontSize: "0.7rem" }}
              variant="outlined"
            />
          )}
          {monthStats.completed > 0 && (
            <Chip
              icon={
                <CircleIcon
                  sx={{
                    fontSize: "8px !important",
                    color: "#10b981 !important",
                  }}
                />
              }
              label={`${monthStats.completed} Completed`}
              size="small"
              sx={{ fontWeight: 500, fontSize: "0.7rem" }}
              variant="outlined"
            />
          )}
        </Box>
      )}{" "}
      {/* end view === "month" stats */}
      {/* Year View */}
      {view === "year" && (
        <Box>
          {/* Year total stats */}
          <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
            {(() => {
              const totals = yearStats.reduce(
                (acc, m) => {
                  acc.total += m.total;
                  acc.confirmed += m.confirmed;
                  acc.draft += m.draft;
                  acc.completed += m.completed;
                  acc.cancelled += m.cancelled;
                  return acc;
                },
                {
                  total: 0,
                  confirmed: 0,
                  draft: 0,
                  completed: 0,
                  cancelled: 0,
                },
              );
              return (
                <>
                  <Chip
                    label={`${totals.total} Events in ${currentYear}`}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      bgcolor: isDark ? "rgba(124,58,237,0.2)" : "#f3e8ff",
                      color: isDark ? "#a78bfa" : "#7c3aed",
                      fontSize: "0.75rem",
                    }}
                  />
                  {totals.confirmed > 0 && (
                    <Chip
                      icon={
                        <CircleIcon
                          sx={{
                            fontSize: "8px !important",
                            color: "#3b82f6 !important",
                          }}
                        />
                      }
                      label={`${totals.confirmed} Confirmed`}
                      size="small"
                      sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                      variant="outlined"
                    />
                  )}
                  {totals.draft > 0 && (
                    <Chip
                      icon={
                        <CircleIcon
                          sx={{
                            fontSize: "8px !important",
                            color: "#f59e0b !important",
                          }}
                        />
                      }
                      label={`${totals.draft} Draft`}
                      size="small"
                      sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                      variant="outlined"
                    />
                  )}
                  {totals.completed > 0 && (
                    <Chip
                      icon={
                        <CircleIcon
                          sx={{
                            fontSize: "8px !important",
                            color: "#10b981 !important",
                          }}
                        />
                      }
                      label={`${totals.completed} Completed`}
                      size="small"
                      sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                      variant="outlined"
                    />
                  )}
                </>
              );
            })()}
          </Box>

          {/* Month cards grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : isTablet
                  ? "repeat(3, 1fr)"
                  : "repeat(4, 1fr)",
              gap: isMobile ? 1.5 : 2,
              mb: 2,
            }}
          >
            {MONTH_NAMES.map((monthName, monthIdx) => {
              const stats = yearStats[monthIdx];
              const isThisMonth =
                monthIdx === today.getMonth() &&
                currentYear === today.getFullYear();
              return (
                <Box
                  key={monthIdx}
                  onClick={() => {
                    setCurrentDate(new Date(currentYear, monthIdx, 1));
                    setView("month");
                  }}
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    borderRadius: 2,
                    border: isThisMonth ? "2px solid" : "1px solid",
                    borderColor: isThisMonth ? "primary.main" : "divider",
                    bgcolor: isThisMonth
                      ? isDark
                        ? "rgba(99,102,241,0.15)"
                        : "#ede9fe"
                      : isDark
                        ? "rgba(255,255,255,0.04)"
                        : "background.paper",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.03)",
                      boxShadow: isDark
                        ? "0 4px 16px rgba(124,58,237,0.25)"
                        : "0 4px 12px rgba(124,58,237,0.15)",
                      borderColor: "primary.light",
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      color: isThisMonth ? "primary.main" : "text.primary",
                      fontSize: isMobile ? "0.8rem" : "0.9rem",
                    }}
                  >
                    {monthName}
                  </Typography>
                  {stats.total > 0 ? (
                    <>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: isMobile ? "1.4rem" : "1.75rem",
                          lineHeight: 1,
                          color: isDark ? "#a78bfa" : "#7c3aed",
                        }}
                      >
                        {stats.total}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 1 }}
                      >
                        event{stats.total !== 1 ? "s" : ""}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {stats.confirmed > 0 && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "#3b82f6",
                            }}
                          />
                        )}
                        {stats.draft > 0 && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "#f59e0b",
                            }}
                          />
                        )}
                        {stats.completed > 0 && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "#10b981",
                            }}
                          />
                        )}
                        {stats.cancelled > 0 && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "#ef4444",
                            }}
                          />
                        )}
                      </Box>
                    </>
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{ color: "text.disabled", fontStyle: "italic" }}
                    >
                      No events
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Legend */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: isMobile ? 1.5 : 3,
              flexWrap: "wrap",
            }}
          >
            {Object.entries(STATUS_COLORS).map(([status, colors]) => (
              <Box
                key={status}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: colors.dot,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: "capitalize",
                    fontWeight: 500,
                    color: "text.secondary",
                    fontSize: isMobile ? "0.65rem" : "0.75rem",
                  }}
                >
                  {status}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {/* Month view: day names + grid + legend */}
      {view === "month" && (
        <Box>
          {/* Day Names Header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0.5,
              mb: 0.5,
            }}
          >
            {(isMobile ? DAY_NAMES_SHORT : DAY_NAMES).map((day, i) => (
              <Box
                key={day + i}
                sx={{
                  textAlign: "center",
                  py: 1,
                  fontWeight: 700,
                  fontSize: isMobile ? "0.7rem" : "0.8rem",
                  color: i === 0 ? "#ef4444" : "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {day}
              </Box>
            ))}
          </Box>

          {/* Calendar Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0.5,
              mb: 2,
            }}
          >
            {calendarDays.map((dayData, index) => {
              const dateKey = toLocalDateKey(dayData.date);
              const dayBookings = bookingsByDate[dateKey] || [];
              const isToday = dateKey === todayKey;
              const hasEvents = dayBookings.length > 0;
              const isSunday = dayData.date.getDay() === 0;
              const isPast =
                dayData.date <
                new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                );

              return (
                <Tooltip
                  key={index}
                  title={
                    hasEvents
                      ? `${dayBookings.length} event${dayBookings.length > 1 ? "s" : ""}: ${dayBookings.map((b) => b.eventDetails?.eventType || "Event").join(", ")}`
                      : ""
                  }
                  arrow
                  disableHoverListener={!hasEvents}
                >
                  <Box
                    onClick={() => handleDayClick(dayData)}
                    sx={{
                      position: "relative",
                      minHeight: isMobile ? 48 : isTablet ? 72 : 90,
                      p: isMobile ? 0.5 : 1,
                      borderRadius: 2,
                      cursor: hasEvents ? "pointer" : "default",
                      border: isToday ? "2px solid" : "1px solid",
                      borderColor: isToday
                        ? "primary.main"
                        : dayData.isCurrentMonth
                          ? "divider"
                          : "transparent",
                      bgcolor: isToday
                        ? isDark
                          ? "rgba(99,102,241,0.2)"
                          : "primary.50"
                        : !dayData.isCurrentMonth
                          ? isDark
                            ? "rgba(255,255,255,0.03)"
                            : "grey.50"
                          : hasEvents
                            ? isDark
                              ? "rgba(124,58,237,0.08)"
                              : "#faf5ff"
                            : isDark
                              ? "rgba(255,255,255,0.04)"
                              : "background.paper",
                      opacity: dayData.isCurrentMonth ? 1 : 0.4,
                      transition: "all 0.2s ease",
                      "&:hover": hasEvents
                        ? {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 12px rgba(124,58,237,0.15)",
                            borderColor: "primary.light",
                          }
                        : {},
                      overflow: "hidden",
                    }}
                  >
                    {/* Day Number */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.25,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: isToday ? 800 : hasEvents ? 700 : 500,
                          fontSize: isMobile ? "0.75rem" : "0.85rem",
                          color: isToday
                            ? "white"
                            : isSunday && dayData.isCurrentMonth
                              ? "#ef4444"
                              : isPast && dayData.isCurrentMonth
                                ? "text.disabled"
                                : "text.primary",
                          width: isToday ? 24 : "auto",
                          height: isToday ? 24 : "auto",
                          borderRadius: "50%",
                          bgcolor: isToday ? "primary.main" : "transparent",
                          ...(isToday && {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }),
                        }}
                      >
                        {dayData.day}
                      </Typography>
                      {hasEvents && dayBookings.length > 1 && (
                        <Typography
                          sx={{
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            color: "white",
                            bgcolor: "#7c3aed",
                            borderRadius: "50%",
                            width: 16,
                            height: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {dayBookings.length}
                        </Typography>
                      )}
                    </Box>

                    {/* Event Indicators */}
                    {!isMobile &&
                      hasEvents &&
                      dayBookings
                        .slice(0, isTablet ? 1 : 2)
                        .map((booking, i) => {
                          const statusColor =
                            STATUS_COLORS[booking.status] ||
                            STATUS_COLORS.draft;
                          return (
                            <Box
                              key={i}
                              sx={{
                                bgcolor: isDark
                                  ? `${statusColor.border}22`
                                  : statusColor.bg,
                                borderLeft: `3px solid ${statusColor.border}`,
                                borderRadius: "0 4px 4px 0",
                                px: 0.5,
                                py: 0.25,
                                mb: 0.25,
                                overflow: "hidden",
                              }}
                            >
                              <Typography
                                noWrap
                                sx={{
                                  fontSize: isTablet ? "0.6rem" : "0.65rem",
                                  fontWeight: 600,
                                  color: isDark
                                    ? statusColor.border
                                    : statusColor.text,
                                  lineHeight: 1.3,
                                }}
                              >
                                {booking.eventDetails?.eventType || "Event"}
                              </Typography>
                              {!isTablet && (
                                <Typography
                                  noWrap
                                  sx={{
                                    fontSize: "0.58rem",
                                    color: isDark
                                      ? "rgba(255,255,255,0.6)"
                                      : statusColor.text,
                                    opacity: isDark ? 1 : 0.8,
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {booking.customer?.name || ""}
                                </Typography>
                              )}
                            </Box>
                          );
                        })}

                    {/* Mobile: Just dots */}
                    {isMobile && hasEvents && (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.25,
                          justifyContent: "center",
                          mt: 0.25,
                          flexWrap: "wrap",
                        }}
                      >
                        {dayBookings.slice(0, 3).map((booking, i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor:
                                STATUS_COLORS[booking.status]?.dot || "#7c3aed",
                            }}
                          />
                        ))}
                      </Box>
                    )}

                    {/* "More" indicator */}
                    {!isMobile && dayBookings.length > (isTablet ? 1 : 2) && (
                      <Typography
                        sx={{
                          fontSize: "0.6rem",
                          color: "primary.main",
                          fontWeight: 600,
                          textAlign: "center",
                        }}
                      >
                        +{dayBookings.length - (isTablet ? 1 : 2)} more
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>

          {/* Legend */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: isMobile ? 1.5 : 3,
              flexWrap: "wrap",
            }}
          >
            {Object.entries(STATUS_COLORS).map(([status, colors]) => (
              <Box
                key={status}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: colors.dot,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: "capitalize",
                    fontWeight: 500,
                    color: "text.secondary",
                    fontSize: isMobile ? "0.65rem" : "0.75rem",
                  }}
                >
                  {status}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}{" "}
      {/* end view === "month" */}
      {/* Booking Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        {selectedDate && (
          <>
            <DialogTitle
              sx={{
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                color: "white",
                py: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <EventIcon />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedDate.date.toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {selectedDate.bookings.length} event
                    {selectedDate.bookings.length > 1 ? "s" : ""} scheduled
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <List disablePadding>
                {selectedDate.bookings.map((booking, index) => {
                  const statusColor =
                    STATUS_COLORS[booking.status] || STATUS_COLORS.draft;
                  return (
                    <React.Fragment key={booking._id || index}>
                      {index > 0 && <Divider />}
                      <ListItem
                        sx={{
                          py: 2,
                          px: 3,
                          cursor: onBookingClick ? "pointer" : "default",
                          transition: "background 0.2s",
                          "&:hover": onBookingClick
                            ? { bgcolor: "action.hover" }
                            : {},
                          borderLeft: `4px solid ${statusColor.border}`,
                        }}
                        onClick={() => {
                          if (onBookingClick) {
                            setDialogOpen(false);
                            onBookingClick(booking);
                          }
                        }}
                      >
                        <Box sx={{ width: "100%" }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1.5,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700, lineHeight: 1.2 }}
                              >
                                {booking.eventDetails?.eventType || "Event"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                #{booking.bookingNumber}
                              </Typography>
                            </Box>
                            <Chip
                              label={booking.status}
                              size="small"
                              sx={{
                                bgcolor: isDark
                                  ? `${statusColor.border}22`
                                  : statusColor.bg,
                                color: isDark
                                  ? statusColor.border
                                  : statusColor.text,
                                fontWeight: 700,
                                textTransform: "capitalize",
                                fontSize: "0.7rem",
                                border: `1px solid ${statusColor.border}`,
                              }}
                            />
                          </Box>

                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                              }}
                            >
                              <PersonIcon
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {booking.customer?.name || "N/A"}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                              }}
                            >
                              <LocationIcon
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography variant="body2" noWrap>
                                {booking.eventDetails?.venue || "N/A"}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                              }}
                            >
                              <GuestsIcon
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography variant="body2">
                                {booking.eventDetails?.guestCount || 0} guests
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                              }}
                            >
                              <MoneyIcon
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  color: "success.main",
                                }}
                              >
                                {formatCurrency(
                                  booking.pricing?.finalPrice ||
                                    booking.pricing?.totalAmount ||
                                    0,
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  );
                })}
              </List>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default BookingCalendar;
