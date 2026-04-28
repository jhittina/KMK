import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Paper,
  useTheme,
  useMediaQuery,
  Chip,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  LocalOffer as PackageIcon,
  EventNote as BookingIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as RevenueIcon,
  AccountBalance as ExpenseIcon,
  Payments as PaymentIcon,
  Receipt as InvoiceIcon,
  AccountBalanceWallet as ProfitIcon,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import Loading from "../components/Common/Loading";
import BookingCalendar from "../components/Common/BookingCalendar";
import { useItems, useExpenses, useExpenseSummary } from "../hooks/useConfig";
import { usePackages, useBookings, useCustomers } from "../hooks/useWorkspace";

function StatCard({ title, value, icon, color, isMobile, trend, trendValue }) {
  return (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderLeft: `4px solid ${color}`,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 16px ${color}30`,
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2, md: 2 },
          "&:last-child": { pb: { xs: 1.5, sm: 2, md: 2 } },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              component="div"
              sx={{
                fontWeight: 800,
                color,
                mb: 0.5,
                fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" },
              }}
            >
              {value}
            </Typography>
            <Typography
              variant={isMobile ? "body2" : "body1"}
              color="text.secondary"
              sx={{
                fontWeight: 500,
                fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
              }}
            >
              {title}
            </Typography>
            {trend && trendValue && (
              <Chip
                size="small"
                icon={
                  trend === "up" ? (
                    <TrendingUpIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 16 }} />
                  )
                }
                label={trendValue}
                color={trend === "up" ? "success" : "error"}
                sx={{ mt: 1, fontWeight: 600, fontSize: "0.7rem" }}
              />
            )}
          </Box>
          <Avatar
            sx={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
              width: { xs: 40, sm: 52, md: 64 },
              height: { xs: 40, sm: 52, md: 64 },
              boxShadow: `0 4px 12px ${color}40`,
            }}
          >
            {React.cloneElement(icon, {
              sx: { color: "white", fontSize: { xs: 24, sm: 30, md: 36 } },
            })}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [revenueView, setRevenueView] = React.useState("yearly"); // 'yearly' or 'monthly'
  const [trendMonths, setTrendMonths] = React.useState(6); // For booking trends
  const [avgValueMonths, setAvgValueMonths] = React.useState(12); // For average booking value
  const [statusTrendMonths, setStatusTrendMonths] = React.useState(6); // For status trend
  const [compareYearOffset, setCompareYearOffset] = React.useState(1); // Years back to compare (1 = last year, 2 = 2 years ago)

  const { data: itemsData, isLoading: itemsLoading } = useItems({
    isActive: true,
  });
  const { data: packagesData, isLoading: packagesLoading } = usePackages({
    isActive: true,
  });
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings();
  const { data: customersData, isLoading: customersLoading } = useCustomers({
    isActive: true,
  });
  const { data: expensesData, isLoading: expensesLoading } = useExpenses({
    isActive: true,
  });
  const { data: expenseSummaryData } = useExpenseSummary();

  // Calculate revenue metrics
  const revenueMetrics = useMemo(() => {
    if (!bookingsData?.data)
      return { total: 0, thisYear: 0, lastYear: 0, growth: 0 };

    const currentYear = new Date().getFullYear();
    const compareYear = currentYear - compareYearOffset;

    let totalRevenue = 0;
    let thisYearRevenue = 0;
    let compareYearRevenue = 0;

    bookingsData.data.forEach((booking) => {
      const bookingYear = new Date(booking.createdAt).getFullYear();
      const revenue = booking.pricing?.totalAmount || 0;

      totalRevenue += revenue;
      if (bookingYear === currentYear) {
        thisYearRevenue += revenue;
      } else if (bookingYear === compareYear) {
        compareYearRevenue += revenue;
      }
    });

    const growth =
      compareYearRevenue > 0
        ? (
            ((thisYearRevenue - compareYearRevenue) / compareYearRevenue) *
            100
          ).toFixed(1)
        : 0;

    return {
      total: totalRevenue,
      thisYear: thisYearRevenue,
      lastYear: compareYearRevenue,
      growth: parseFloat(growth),
    };
  }, [bookingsData, compareYearOffset]);

  // Calculate profit metrics (revenue - expenses)
  const profitMetrics = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const now = new Date();

    const monthlyExpense = expenseSummaryData?.data?.monthlyTotal || 0;
    const oneTimeExpenseYear = expenseSummaryData?.data?.oneTimeTotal || 0;
    const yearlyExpense = monthlyExpense * 12 + oneTimeExpenseYear;

    // This year revenue
    const thisYearRevenue = revenueMetrics.thisYear;
    const thisYearProfit = thisYearRevenue - yearlyExpense;

    // This month one-time expenses (from full expense list)
    const oneTimeExpenseMonth = (() => {
      if (!expensesData?.data) return 0;
      return expensesData.data
        .filter((e) => {
          if (e.type !== "one-time") return false;
          const d = new Date(e.startDate);
          return (
            d.getMonth() === now.getMonth() && d.getFullYear() === currentYear
          );
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);
    })();

    const thisMonthTotalExpense = monthlyExpense + oneTimeExpenseMonth;

    const thisMonthRevenue = (() => {
      if (!bookingsData?.data) return 0;
      return bookingsData.data
        .filter((b) => {
          const d = new Date(b.createdAt);
          return (
            d.getMonth() === now.getMonth() && d.getFullYear() === currentYear
          );
        })
        .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
    })();

    const thisMonthProfit = thisMonthRevenue - thisMonthTotalExpense;
    const profitMarginYear =
      thisYearRevenue > 0
        ? ((thisYearProfit / thisYearRevenue) * 100).toFixed(1)
        : 0;
    const profitMarginMonth =
      thisMonthRevenue > 0
        ? ((thisMonthProfit / thisMonthRevenue) * 100).toFixed(1)
        : 0;

    // Monthly profit trend (last 12 months) — include one-time per month
    const monthlyTrend = (() => {
      if (!bookingsData?.data) return [];
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        const monthRevenue = bookingsData.data
          .filter((b) => {
            const bd = new Date(b.createdAt);
            return (
              bd.getMonth() === d.getMonth() &&
              bd.getFullYear() === d.getFullYear()
            );
          })
          .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

        const oneTimeThisMonth = expensesData?.data
          ? expensesData.data
              .filter((e) => {
                if (e.type !== "one-time") return false;
                const ed = new Date(e.startDate);
                return (
                  ed.getMonth() === d.getMonth() &&
                  ed.getFullYear() === d.getFullYear()
                );
              })
              .reduce((sum, e) => sum + (e.amount || 0), 0)
          : 0;

        const totalExpensesMonth = monthlyExpense + oneTimeThisMonth;
        const monthLabel = d.toLocaleString("default", { month: "short" });
        return {
          month: `${monthLabel} ${d.getFullYear()}`,
          revenue: monthRevenue,
          expenses: totalExpensesMonth,
          profit: monthRevenue - totalExpensesMonth,
        };
      });
    })();

    return {
      monthlyExpense,
      oneTimeExpenseYear,
      oneTimeExpenseMonth,
      yearlyExpense,
      thisMonthTotalExpense,
      thisMonthRevenue,
      thisMonthProfit,
      thisYearProfit,
      profitMarginYear: parseFloat(profitMarginYear),
      profitMarginMonth: parseFloat(profitMarginMonth),
      monthlyTrend,
    };
  }, [expenseSummaryData, expensesData, revenueMetrics, bookingsData]);
  const bookingStatusData = useMemo(() => {
    if (!bookingsData?.data) return [];

    const statusCount = bookingsData.data.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: "Draft", value: statusCount.draft || 0, color: "#f59e0b" },
      {
        name: "Confirmed",
        value: statusCount.confirmed || 0,
        color: "#3b82f6",
      },
      {
        name: "Completed",
        value: statusCount.completed || 0,
        color: "#10b981",
      },
      {
        name: "Cancelled",
        value: statusCount.cancelled || 0,
        color: "#ef4444",
      },
    ].filter((item) => item.value > 0);
  }, [bookingsData]);

  // Process event type data
  const eventTypeData = useMemo(() => {
    if (!bookingsData?.data) return [];

    const typeCount = bookingsData.data.reduce((acc, booking) => {
      const type = booking.eventDetails?.eventType || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(typeCount).map(([name, count]) => ({
      name,
      bookings: count,
    }));
  }, [bookingsData]);

  // Process monthly revenue trend with year comparison
  const monthlyRevenueData = useMemo(() => {
    if (!bookingsData?.data) return [];

    const currentYear = new Date().getFullYear();
    const compareYear = currentYear - compareYearOffset;
    const monthlyData = {};

    // Initialize months
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(currentYear, i).toLocaleString("default", {
        month: "short",
      });
      monthlyData[i] = {
        month: monthName,
        thisYear: 0,
        lastYear: 0,
      };
    }

    bookingsData.data.forEach((booking) => {
      const date = new Date(booking.createdAt);
      const bookingYear = date.getFullYear();
      const month = date.getMonth();
      const revenue = booking.pricing?.totalAmount || 0;

      if (bookingYear === currentYear && monthlyData[month]) {
        monthlyData[month].thisYear += revenue;
      } else if (bookingYear === compareYear && monthlyData[month]) {
        monthlyData[month].lastYear += revenue;
      }
    });

    return Object.values(monthlyData);
  }, [bookingsData, compareYearOffset]);

  // Process monthly bookings trend
  const monthlyTrendData = useMemo(() => {
    if (!bookingsData?.data) return [];

    const monthlyCount = bookingsData.data.reduce((acc, booking) => {
      const date = new Date(booking.createdAt);
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(monthlyCount)
      .map(([month, count]) => ({ month, bookings: count }))
      .slice(-trendMonths); // User-selected months
  }, [bookingsData, trendMonths]);

  // Popular packages by booking count
  const popularPackagesData = useMemo(() => {
    if (!bookingsData?.data || !packagesData?.data) return [];

    const packageCount = {};

    bookingsData.data.forEach((booking) => {
      booking.packages?.forEach((pkg) => {
        const name = pkg.packageName || "Unknown";
        packageCount[name] = (packageCount[name] || 0) + 1;
      });
    });

    return Object.entries(packageCount)
      .map(([name, count]) => ({ name, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  }, [bookingsData, packagesData]);

  // Process package category data
  const packageCategoryData = useMemo(() => {
    if (!packagesData?.data) return [];

    const categoryCount = packagesData.data.reduce((acc, pkg) => {
      const category = pkg.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCount).map(([name, count]) => ({
      name,
      packages: count,
    }));
  }, [packagesData]);

  // Revenue by Event Type
  const revenueByEventTypeData = useMemo(() => {
    if (!bookingsData?.data) return [];

    const revenueByType = bookingsData.data
      .filter((b) => b.status === "completed")
      .reduce((acc, booking) => {
        const type = booking.eventDetails?.eventType || "Unknown";
        acc[type] = (acc[type] || 0) + booking.pricing.totalAmount;
        return acc;
      }, {});

    return Object.entries(revenueByType).map(([name, value]) => ({
      name,
      value,
    }));
  }, [bookingsData]);

  // Guest Count Distribution
  const guestDistributionData = useMemo(() => {
    if (!bookingsData?.data) return [];

    const ranges = [
      { label: "0-100", min: 0, max: 100, count: 0 },
      { label: "101-200", min: 101, max: 200, count: 0 },
      { label: "201-400", min: 201, max: 400, count: 0 },
      { label: "401-600", min: 401, max: 600, count: 0 },
      { label: "600+", min: 601, max: Infinity, count: 0 },
    ];

    bookingsData.data.forEach((booking) => {
      const guests = booking.eventDetails?.guestCount || 0;
      const range = ranges.find((r) => guests >= r.min && guests <= r.max);
      if (range) range.count++;
    });

    return ranges
      .filter((r) => r.count > 0)
      .map((r) => ({
        range: r.label,
        bookings: r.count,
      }));
  }, [bookingsData]);

  // Average Booking Value by Month
  const avgBookingValueData = useMemo(() => {
    if (!bookingsData?.data) return [];

    const monthlyData = {};

    bookingsData.data
      .filter((b) => b.status === "completed")
      .forEach((booking) => {
        const date = new Date(booking.createdAt);
        const monthKey = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, count: 0 };
        }

        monthlyData[monthKey].total += booking.pricing.totalAmount;
        monthlyData[monthKey].count++;
      });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        avgValue: Math.round(data.total / data.count),
      }))
      .slice(-avgValueMonths); // User-selected months
  }, [bookingsData, avgValueMonths]);

  // Booking Status Trend Over Time
  const statusTrendData = useMemo(() => {
    if (!bookingsData?.data) return [];

    const monthsData = [];
    const currentDate = new Date();

    for (let i = statusTrendMonths - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      const monthKey = date.toLocaleString("default", { month: "short" });

      const monthBookings = bookingsData.data.filter((b) => {
        const bookingDate = new Date(b.createdAt);
        return (
          bookingDate.getMonth() === date.getMonth() &&
          bookingDate.getFullYear() === date.getFullYear()
        );
      });

      monthsData.push({
        month: monthKey,
        draft: monthBookings.filter((b) => b.status === "draft").length,
        confirmed: monthBookings.filter((b) => b.status === "confirmed").length,
        completed: monthBookings.filter((b) => b.status === "completed").length,
      });
    }

    return monthsData;
  }, [bookingsData, statusTrendMonths]);

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${(revenueMetrics.total / 1000).toFixed(0)}K`,
      icon: <RevenueIcon />,
      color: "#10b981",
      trend: revenueMetrics.growth > 0 ? "up" : "down",
      trendValue: `${Math.abs(revenueMetrics.growth)}%`,
    },
    {
      title: "Total Items",
      value: itemsData?.count || 0,
      icon: <InventoryIcon />,
      color: "#8b5cf6",
    },
    {
      title: "Active Packages",
      value: packagesData?.count || 0,
      icon: <PackageIcon />,
      color: "#a78bfa",
    },
    {
      title: "Total Bookings",
      value: bookingsData?.count || 0,
      icon: <BookingIcon />,
      color: "#ec4899",
    },
    {
      title: "Total Customers",
      value: customersData?.count || 0,
      icon: <PeopleIcon />,
      color: "#7c3aed",
    },
  ];

  if (
    itemsLoading ||
    packagesLoading ||
    bookingsLoading ||
    customersLoading ||
    expensesLoading
  )
    return <Loading message="Loading dashboard..." />;

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 0 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700 }}>
          Business Analytics
        </Typography>
        {revenueMetrics.growth !== 0 && (
          <Chip
            icon={
              revenueMetrics.growth > 0 ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              )
            }
            label={`${revenueMetrics.growth > 0 ? "+" : ""}${revenueMetrics.growth}% YoY`}
            color={revenueMetrics.growth > 0 ? "success" : "error"}
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={6} md={index === 0 ? 12 : 3} key={index}>
            <StatCard {...stat} isMobile={isMobile} />
          </Grid>
        ))}
      </Grid>

      {/* Tabs for different views */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Calendar" />
          <Tab label="Revenue Analytics" />
          <Tab label="Performance" />
          <Tab label="Expenses" />
          <Tab label="Profit" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {selectedTab === 0 && (
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Booking Status Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                Booking Status Distribution
              </Typography>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 250 : isTablet ? 280 : 300}
              >
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={
                      isMobile
                        ? false
                        : ({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={isMobile ? 70 : isTablet ? 85 : 100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: isMobile ? "12px" : "14px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Event Type Comparison */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                Events by Type
              </Typography>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 250 : isTablet ? 280 : 300}
              >
                <BarChart data={eventTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 60 : 30}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  <Bar
                    dataKey="bookings"
                    fill="#8b5cf6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Monthly Bookings Trend */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: { xs: 2, md: 3 },
                }}
              >
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                  }}
                >
                  Booking Trends
                </Typography>
                <Select
                  size="small"
                  value={trendMonths}
                  onChange={(e) => setTrendMonths(e.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value={3}>Last 3 Months</MenuItem>
                  <MenuItem value={6}>Last 6 Months</MenuItem>
                  <MenuItem value={9}>Last 9 Months</MenuItem>
                  <MenuItem value={12}>Last 12 Months</MenuItem>
                </Select>
              </Box>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 250 : isTablet ? 280 : 300}
              >
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 60 : 30}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#ec4899"
                    strokeWidth={isMobile ? 2 : 3}
                    dot={{ fill: "#ec4899", r: isMobile ? 4 : 6 }}
                    activeDot={{ r: isMobile ? 6 : 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Package Categories */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                Packages by Category
              </Typography>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 250 : isTablet ? 280 : 300}
              >
                <BarChart data={packageCategoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#6b7280"
                    width={isMobile ? 70 : isTablet ? 85 : 100}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  <Bar
                    dataKey="packages"
                    fill="#a78bfa"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Calendar Tab */}
      {selectedTab === 1 && (
        <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <BookingCalendar
            bookings={bookingsData?.data || []}
            onBookingClick={(booking) =>
              navigate(`/workspace/bookings/${booking._id}`)
            }
          />
        </Paper>
      )}

      {/* Revenue Analytics Tab */}
      {selectedTab === 2 && (
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Year-over-Year Revenue Comparison */}
          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                  }}
                >
                  Revenue Comparison -{" "}
                  {revenueView === "yearly"
                    ? "Year over Year"
                    : "Month by Month"}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  {revenueView === "yearly" && (
                    <Select
                      size="small"
                      value={compareYearOffset}
                      onChange={(e) => setCompareYearOffset(e.target.value)}
                      sx={{ minWidth: 150 }}
                    >
                      <MenuItem value={1}>
                        Compare with {new Date().getFullYear() - 1}
                      </MenuItem>
                      <MenuItem value={2}>
                        Compare with {new Date().getFullYear() - 2}
                      </MenuItem>
                      <MenuItem value={3}>
                        Compare with {new Date().getFullYear() - 3}
                      </MenuItem>
                    </Select>
                  )}
                  <ToggleButtonGroup
                    value={revenueView}
                    exclusive
                    onChange={(e, newView) =>
                      newView && setRevenueView(newView)
                    }
                    size="small"
                    color="primary"
                  >
                    <ToggleButton value="yearly">Yearly</ToggleButton>
                    <ToggleButton value="monthly">Monthly</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 300 : isTablet ? 350 : 400}
              >
                <ComposedChart
                  data={
                    revenueView === "yearly"
                      ? monthlyRevenueData
                      : monthlyRevenueData
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  <Legend />
                  {revenueView === "yearly" ? (
                    <>
                      <Area
                        type="monotone"
                        dataKey="lastYear"
                        fill="#9ca3af"
                        stroke="#6b7280"
                        fillOpacity={0.3}
                        name={`${new Date().getFullYear() - compareYearOffset} Revenue`}
                      />
                      <Bar
                        dataKey="thisYear"
                        fill="#10b981"
                        radius={[8, 8, 0, 0]}
                        name={`${new Date().getFullYear()} Revenue`}
                      />
                      <Line
                        type="monotone"
                        dataKey="thisYear"
                        stroke="#059669"
                        strokeWidth={2}
                        dot={false}
                      />
                    </>
                  ) : (
                    <>
                      <Bar
                        dataKey="thisYear"
                        fill="#8b5cf6"
                        radius={[8, 8, 0, 0]}
                        name="Monthly Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="thisYear"
                        stroke="#7c3aed"
                        strokeWidth={3}
                        dot={{ fill: "#7c3aed", r: 4 }}
                        name="Trend"
                      />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                {revenueView === "yearly" ? (
                  <>
                    <Chip
                      label={`This Year: ₹${(revenueMetrics.thisYear / 1000).toFixed(0)}K`}
                      color="success"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip
                      label={`Last Year: ₹${(revenueMetrics.lastYear / 1000).toFixed(0)}K`}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip
                      icon={
                        revenueMetrics.growth > 0 ? (
                          <TrendingUpIcon />
                        ) : (
                          <TrendingDownIcon />
                        )
                      }
                      label={`Growth: ${revenueMetrics.growth > 0 ? "+" : ""}${revenueMetrics.growth}%`}
                      color={revenueMetrics.growth > 0 ? "success" : "error"}
                      sx={{ fontWeight: 600 }}
                    />
                  </>
                ) : (
                  <>
                    <Chip
                      label={`Total: ₹${(revenueMetrics.thisYear / 1000).toFixed(0)}K`}
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip
                      label={`Avg/Month: ₹${(revenueMetrics.thisYear / 12 / 1000).toFixed(0)}K`}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Monthly Bookings Trend */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: { xs: 2, md: 3 },
                }}
              >
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                  }}
                >
                  Booking Trends
                </Typography>
                <Select
                  size="small"
                  value={trendMonths}
                  onChange={(e) => setTrendMonths(e.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value={3}>Last 3 Months</MenuItem>
                  <MenuItem value={6}>Last 6 Months</MenuItem>
                  <MenuItem value={9}>Last 9 Months</MenuItem>
                  <MenuItem value={12}>Last 12 Months</MenuItem>
                </Select>
              </Box>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 250 : isTablet ? 280 : 300}
              >
                <AreaChart data={monthlyTrendData}>
                  <defs>
                    <linearGradient
                      id="colorBookings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#ec4899"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 60 : 30}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#ec4899"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Average Booking Value */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                Key Revenue Metrics
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Booking Value
                  </Typography>
                  <Typography
                    variant="h4"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  >
                    ₹
                    {bookingsData?.count > 0
                      ? (
                          revenueMetrics.total / bookingsData.count
                        ).toLocaleString("en-IN", { maximumFractionDigits: 0 })
                      : 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue This Year
                  </Typography>
                  <Typography
                    variant="h4"
                    color="success.main"
                    sx={{ fontWeight: 700 }}
                  >
                    ₹{revenueMetrics.thisYear.toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Revenue Per Customer
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ₹
                    {customersData?.count > 0
                      ? (
                          revenueMetrics.total / customersData.count
                        ).toLocaleString("en-IN", { maximumFractionDigits: 0 })
                      : 0}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Performance Tab */}
      {selectedTab === 3 && (
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Popular Packages */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                Top 5 Most Booked Packages
              </Typography>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 250 : isTablet ? 280 : 300}
              >
                <BarChart data={popularPackagesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#6b7280"
                    width={isMobile ? 80 : isTablet ? 100 : 120}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  <Bar dataKey="bookings" fill="#8b5cf6" radius={[0, 8, 8, 0]}>
                    {popularPackagesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${270 - index * 15}, 70%, 60%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Business Insights */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                Business Insights & Recommendations
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {revenueMetrics.growth > 0 && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "success.50",
                      borderRadius: 2,
                      borderLeft: "4px solid",
                      borderColor: "success.main",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "success.dark", mb: 0.5 }}
                    >
                      📈 Strong Growth
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Revenue is up {revenueMetrics.growth}% compared to last
                      year. Keep up the great work! Consider investing in
                      marketing to accelerate growth.
                    </Typography>
                  </Box>
                )}
                {revenueMetrics.growth < 0 && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "error.50",
                      borderRadius: 2,
                      borderLeft: "4px solid",
                      borderColor: "error.main",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "error.dark", mb: 0.5 }}
                    >
                      ⚠️ Revenue Decline
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Revenue is down {Math.abs(revenueMetrics.growth)}%
                      compared to last year. Consider promotional campaigns,
                      customer outreach, or package refreshes.
                    </Typography>
                  </Box>
                )}
                {popularPackagesData.length > 0 && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "info.50",
                      borderRadius: 2,
                      borderLeft: "4px solid",
                      borderColor: "info.main",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "info.dark", mb: 0.5 }}
                    >
                      🎯 Top Performer
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      "{popularPackagesData[0]?.name}" is your most popular
                      package with {popularPackagesData[0]?.bookings} bookings.
                      {popularPackagesData[0]?.bookings > 1
                        ? " Consider creating similar packages or premium variations."
                        : " Focus on promoting this package to gain traction."}
                    </Typography>
                  </Box>
                )}
                {bookingsData?.count > 0 && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "warning.50",
                      borderRadius: 2,
                      borderLeft: "4px solid",
                      borderColor: "warning.main",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "warning.dark", mb: 0.5 }}
                    >
                      💡 Opportunity
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {
                        bookingsData.data.filter((b) => b.status === "draft")
                          .length
                      }{" "}
                      {bookingsData.data.filter((b) => b.status === "draft")
                        .length === 1
                        ? "booking is"
                        : "bookings are"}{" "}
                      in draft status. Follow up within 24-48 hours to convert
                      them! Draft bookings have a higher chance of conversion
                      with timely communication.
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "primary.50",
                    borderRadius: 2,
                    borderLeft: "4px solid",
                    borderColor: "primary.main",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "primary.dark", mb: 0.5 }}
                  >
                    👥 Customer Base
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You have {customersData?.count || 0} customers. Average of{" "}
                    {customersData?.count > 0
                      ? (bookingsData?.count / customersData.count).toFixed(1)
                      : 0}{" "}
                    bookings per customer.
                    {customersData?.count > 0 &&
                    bookingsData?.count / customersData.count < 1.5
                      ? " Focus on customer retention and repeat bookings through loyalty programs."
                      : " Great customer retention! Consider referral programs to grow your base."}
                  </Typography>
                </Box>
                {packagesData?.count > 0 && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "secondary.50",
                      borderRadius: 2,
                      borderLeft: "4px solid",
                      borderColor: "secondary.main",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "secondary.dark", mb: 0.5 }}
                    >
                      📦 Package Portfolio
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You have {packagesData.count} active packages.
                      {packagesData.count < 3
                        ? " Consider creating more package options to cater to different budgets and preferences."
                        : packagesData.count > 10
                          ? " You have a wide variety. Monitor which packages aren't performing and consider retiring or updating them."
                          : " Good variety! Regularly update packages based on seasonal trends and customer feedback."}
                    </Typography>
                  </Box>
                )}
                {bookingsData?.data &&
                  bookingsData.data.filter((b) => b.status === "completed")
                    .length > 0 && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "success.50",
                        borderRadius: 2,
                        borderLeft: "4px solid",
                        borderColor: "success.main",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: "success.dark", mb: 0.5 }}
                      >
                        ✅ Completed Events
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {
                          bookingsData.data.filter(
                            (b) => b.status === "completed",
                          ).length
                        }{" "}
                        events completed successfully! Request reviews and
                        testimonials to build social proof. Consider follow-up
                        surveys to improve services.
                      </Typography>
                    </Box>
                  )}
                {bookingsData?.data &&
                  bookingsData.data.filter((b) => b.status === "confirmed")
                    .length > 0 && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "info.50",
                        borderRadius: 2,
                        borderLeft: "4px solid",
                        borderColor: "info.main",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: "info.dark", mb: 0.5 }}
                      >
                        📅 Upcoming Events
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {
                          bookingsData.data.filter(
                            (b) => b.status === "confirmed",
                          ).length
                        }{" "}
                        confirmed bookings coming up. Send reminder emails 1
                        week and 2 days before events. Ensure all arrangements
                        are finalized.
                      </Typography>
                    </Box>
                  )}
              </Box>
            </Paper>
          </Grid>

          {/* Additional Analytics Row */}
          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                Booking Conversion Funnel
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "info.50",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "info.main" }}
                    >
                      {bookingsData?.data.filter((b) => b.status === "draft")
                        .length || 0}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      📝 Draft Inquiries
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Initial interest
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "warning.50",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "warning.main" }}
                    >
                      {bookingsData?.data.filter(
                        (b) => b.status === "confirmed",
                      ).length || 0}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      ✅ Confirmed Bookings
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {bookingsData?.data.length > 0
                        ? `${((bookingsData.data.filter((b) => b.status === "confirmed").length / bookingsData.data.filter((b) => b.status !== "cancelled").length) * 100).toFixed(1)}% conversion`
                        : "0% conversion"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "success.50",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "success.main" }}
                    >
                      {bookingsData?.data.filter(
                        (b) => b.status === "completed",
                      ).length || 0}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      🎉 Completed Events
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {bookingsData?.data.length > 0
                        ? `${((bookingsData.data.filter((b) => b.status === "completed").length / bookingsData.data.filter((b) => b.status !== "cancelled").length) * 100).toFixed(1)}% completion`
                        : "0% completion"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "error.50",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "error.main" }}
                    >
                      {bookingsData?.data.filter(
                        (b) => b.status === "cancelled",
                      ).length || 0}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      ❌ Cancelled
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {bookingsData?.data.length > 0
                        ? `${((bookingsData.data.filter((b) => b.status === "cancelled").length / bookingsData.data.length) * 100).toFixed(1)}% cancellation`
                        : "0% cancellation"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Revenue & Performance Metrics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                💰 Revenue Performance Metrics
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Average Booking Value
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      ₹
                      {bookingsData?.data.filter(
                        (b) => b.status === "completed",
                      ).length > 0
                        ? Math.round(
                            bookingsData.data
                              .filter((b) => b.status === "completed")
                              .reduce(
                                (sum, b) => sum + b.pricing.totalAmount,
                                0,
                              ) /
                              bookingsData.data.filter(
                                (b) => b.status === "completed",
                              ).length,
                          ).toLocaleString("en-IN")
                        : "0"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      bgcolor: "grey.200",
                      height: 8,
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: "75%",
                        bgcolor: "primary.main",
                        height: 8,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Per completed event
                  </Typography>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Total Potential Revenue
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "success.main" }}
                    >
                      ₹
                      {bookingsData?.data.filter(
                        (b) => b.status === "confirmed",
                      ).length > 0
                        ? Math.round(
                            bookingsData.data
                              .filter((b) => b.status === "confirmed")
                              .reduce(
                                (sum, b) => sum + b.pricing.totalAmount,
                                0,
                              ),
                          ).toLocaleString("en-IN")
                        : "0"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      bgcolor: "grey.200",
                      height: 8,
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: "60%",
                        bgcolor: "success.main",
                        height: 8,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    From confirmed bookings
                  </Typography>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Average Guest Count
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "info.main" }}
                    >
                      {bookingsData?.data.length > 0
                        ? Math.round(
                            bookingsData.data.reduce(
                              (sum, b) => sum + b.eventDetails.guestCount,
                              0,
                            ) / bookingsData.data.length,
                          )
                        : 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      bgcolor: "grey.200",
                      height: 8,
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: "50%",
                        bgcolor: "info.main",
                        height: 8,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Guests per event
                  </Typography>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Conversion Rate (Draft → Confirmed)
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "warning.main" }}
                    >
                      {bookingsData?.data.length > 0
                        ? `${((bookingsData.data.filter((b) => b.status !== "draft" && b.status !== "cancelled").length / bookingsData.data.length) * 100).toFixed(1)}%`
                        : "0%"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      bgcolor: "grey.200",
                      height: 8,
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width:
                          bookingsData?.data.length > 0
                            ? `${(bookingsData.data.filter((b) => b.status !== "draft" && b.status !== "cancelled").length / bookingsData.data.length) * 100}%`
                            : "0%",
                        bgcolor: "warning.main",
                        height: 8,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Industry average: 30-40%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Peak Demand Analysis */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                📊 Business Intelligence
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {(() => {
                  const eventTypes =
                    bookingsData?.data.reduce((acc, booking) => {
                      const type = booking.eventDetails.eventType;
                      acc[type] = (acc[type] || 0) + 1;
                      return acc;
                    }, {}) || {};
                  const mostPopularEvent = Object.entries(eventTypes).sort(
                    (a, b) => b[1] - a[1],
                  )[0];

                  return (
                    mostPopularEvent && (
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "primary.50",
                          borderRadius: 2,
                          borderLeft: "4px solid",
                          borderColor: "primary.main",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: "primary.dark",
                            mb: 0.5,
                          }}
                        >
                          🎪 Most Popular Event Type
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>{mostPopularEvent[0]}</strong> events lead
                          with {mostPopularEvent[1]} bookings (
                          {(
                            (mostPopularEvent[1] / bookingsData.data.length) *
                            100
                          ).toFixed(1)}
                          %). Consider specialized packages for this segment.
                        </Typography>
                      </Box>
                    )
                  );
                })()}

                {(() => {
                  const monthlyBookings =
                    bookingsData?.data.reduce((acc, booking) => {
                      const month = new Date(
                        booking.eventDetails.eventDate,
                      ).toLocaleString("default", { month: "long" });
                      acc[month] = (acc[month] || 0) + 1;
                      return acc;
                    }, {}) || {};
                  const peakMonth = Object.entries(monthlyBookings).sort(
                    (a, b) => b[1] - a[1],
                  )[0];

                  return (
                    peakMonth && (
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "secondary.50",
                          borderRadius: 2,
                          borderLeft: "4px solid",
                          borderColor: "secondary.main",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: "secondary.dark",
                            mb: 0.5,
                          }}
                        >
                          📅 Peak Season
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>{peakMonth[0]}</strong> is your busiest month
                          with {peakMonth[1]} bookings. Plan staffing and
                          inventory accordingly. Consider premium pricing during
                          peak periods.
                        </Typography>
                      </Box>
                    )
                  );
                })()}

                {bookingsData?.data &&
                  bookingsData.data.filter((b) => b.status === "confirmed")
                    .length > 0 && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "warning.50",
                        borderRadius: 2,
                        borderLeft: "4px solid",
                        borderColor: "warning.main",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: "warning.dark", mb: 0.5 }}
                      >
                        ⏰ Revenue at Risk
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ₹
                        {Math.round(
                          bookingsData.data
                            .filter((b) => b.status === "draft")
                            .reduce((sum, b) => sum + b.pricing.totalAmount, 0),
                        ).toLocaleString("en-IN")}{" "}
                        in potential revenue from{" "}
                        {
                          bookingsData.data.filter((b) => b.status === "draft")
                            .length
                        }{" "}
                        draft bookings. Quick follow-ups can secure these deals!
                      </Typography>
                    </Box>
                  )}

                {customersData?.count > 0 && bookingsData?.data.length > 0 && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "success.50",
                      borderRadius: 2,
                      borderLeft: "4px solid",
                      borderColor: "success.main",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "success.dark", mb: 0.5 }}
                    >
                      🔄 Repeat Customer Rate
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(bookingsData.data.length / customersData.count).toFixed(
                        2,
                      )}
                      x average bookings per customer.
                      {bookingsData.data.length / customersData.count > 1.5
                        ? " Excellent retention! Your customers love coming back."
                        : " Focus on building long-term relationships with loyalty programs and follow-ups."}
                    </Typography>
                  </Box>
                )}

                {packagesData?.data &&
                  packagesData.data.length > 0 &&
                  bookingsData?.data && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "info.50",
                        borderRadius: 2,
                        borderLeft: "4px solid",
                        borderColor: "info.main",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: "info.dark", mb: 0.5 }}
                      >
                        💎 Package Utilization
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(
                          bookingsData.data.length / packagesData.data.length
                        ).toFixed(1)}{" "}
                        bookings per package on average.
                        {bookingsData.data.length / packagesData.data.length < 5
                          ? " Some packages may be underperforming. Review and optimize your offerings."
                          : " Great package performance! Your offerings resonate with customers."}
                      </Typography>
                    </Box>
                  )}
              </Box>
            </Paper>
          </Grid>

          {/* Revenue by Event Type */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                💰 Revenue by Event Type
              </Typography>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 250 : isTablet ? 280 : 300}
              >
                <PieChart>
                  <Pie
                    data={revenueByEventTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={isMobile ? 80 : 100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueByEventTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${index * 60}, 70%, 60%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      `₹${Math.round(value).toLocaleString("en-IN")}`
                    }
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Guest Count Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                👥 Guest Count Distribution
              </Typography>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 250 : isTablet ? 280 : 300}
              >
                <BarChart data={guestDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="range"
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  <Bar dataKey="bookings" fill="#10b981" radius={[8, 8, 0, 0]}>
                    {guestDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${140 + index * 20}, 70%, 50%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Booking Status Trend */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: { xs: 2, md: 3 },
                }}
              >
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                  }}
                >
                  📊 Booking Status Trend
                </Typography>
                <Select
                  size="small"
                  value={statusTrendMonths}
                  onChange={(e) => setStatusTrendMonths(e.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value={3}>Last 3 Months</MenuItem>
                  <MenuItem value={6}>Last 6 Months</MenuItem>
                  <MenuItem value={9}>Last 9 Months</MenuItem>
                  <MenuItem value={12}>Last 12 Months</MenuItem>
                </Select>
              </Box>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 250 : isTablet ? 280 : 300}
              >
                <LineChart data={statusTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="draft"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Draft"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="confirmed"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Confirmed"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Completed"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Average Booking Value Over Time */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: { xs: 2, md: 3 },
                }}
              >
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                  }}
                >
                  💵 Average Booking Value Trend
                </Typography>
                <Select
                  size="small"
                  value={avgValueMonths}
                  onChange={(e) => setAvgValueMonths(e.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value={6}>Last 6 Months</MenuItem>
                  <MenuItem value={12}>Last 12 Months</MenuItem>
                  <MenuItem value={18}>Last 18 Months</MenuItem>
                  <MenuItem value={24}>Last 24 Months</MenuItem>
                </Select>
              </Box>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 250 : isTablet ? 280 : 300}
              >
                <AreaChart data={avgBookingValueData}>
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value) =>
                      `₹${Math.round(value).toLocaleString("en-IN")}`
                    }
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgValue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAvg)"
                    name="Avg Value"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Expenses Tab */}
      {selectedTab === 4 && (
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Expense Stats Cards */}
          <Grid item xs={6} md={3}>
            <Card
              sx={{
                background:
                  "linear-gradient(135deg, #ef444415 0%, #ef444405 100%)",
                borderLeft: "4px solid #ef4444",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 16px #ef444430",
                },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#ef4444", width: 48, height: 48 }}>
                    <ExpenseIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{ fontWeight: 800, color: "#ef4444" }}
                    >
                      ₹
                      {(
                        (expenseSummaryData?.data?.monthlyTotal || 0) / 1000
                      ).toFixed(1)}
                      K
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Expenses
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card
              sx={{
                background:
                  "linear-gradient(135deg, #f59e0b15 0%, #f59e0b05 100%)",
                borderLeft: "4px solid #f59e0b",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 16px #f59e0b30",
                },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#f59e0b", width: 48, height: 48 }}>
                    <InvoiceIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{ fontWeight: 800, color: "#f59e0b" }}
                    >
                      ₹
                      {(
                        (expenseSummaryData?.data?.oneTimeTotal || 0) / 1000
                      ).toFixed(1)}
                      K
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      One-time Investments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card
              sx={{
                background:
                  "linear-gradient(135deg, #8b5cf615 0%, #8b5cf605 100%)",
                borderLeft: "4px solid #8b5cf6",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 16px #8b5cf630",
                },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#8b5cf6", width: 48, height: 48 }}>
                    <ExpenseIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{ fontWeight: 800, color: "#8b5cf6" }}
                    >
                      ₹
                      {(
                        (expenseSummaryData?.data?.totalExpenses || 0) / 1000
                      ).toFixed(1)}
                      K
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Expenses
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card
              sx={{
                background:
                  "linear-gradient(135deg, #ec489915 0%, #ec489905 100%)",
                borderLeft: "4px solid #ec4899",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 16px #ec489930",
                },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#ec4899", width: 48, height: 48 }}>
                    <PaymentIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{ fontWeight: 800, color: "#ec4899" }}
                    >
                      {expenseSummaryData?.data?.pendingPaymentsCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Payments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Breakdown */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                Expense Distribution by Category
              </Typography>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 250 : isTablet ? 280 : 300}
              >
                <PieChart>
                  <Pie
                    data={(
                      expenseSummaryData?.data?.categoryBreakdown || []
                    ).map((cat) => ({
                      name:
                        cat.category.charAt(0).toUpperCase() +
                        cat.category.slice(1),
                      value: cat.total,
                      color:
                        cat.category === "salary"
                          ? "#3b82f6"
                          : cat.category === "expenses"
                            ? "#ef4444"
                            : cat.category === "new_inventory"
                              ? "#ec4899"
                              : cat.category === "investment"
                                ? "#10b981"
                                : cat.category === "utilities"
                                  ? "#f59e0b"
                                  : cat.category === "rent"
                                    ? "#8b5cf6"
                                    : "#6b7280",
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={
                      isMobile
                        ? false
                        : ({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={isMobile ? 70 : isTablet ? 85 : 100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(expenseSummaryData?.data?.categoryBreakdown || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.category === "salary"
                              ? "#3b82f6"
                              : entry.category === "expenses"
                                ? "#ef4444"
                                : entry.category === "new_inventory"
                                  ? "#ec4899"
                                  : entry.category === "investment"
                                    ? "#10b981"
                                    : entry.category === "utilities"
                                      ? "#f59e0b"
                                      : entry.category === "rent"
                                        ? "#8b5cf6"
                                        : "#6b7280"
                          }
                        />
                      ),
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      `₹${Math.round(value).toLocaleString("en-IN")}`
                    }
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: isMobile ? "11px" : "13px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Monthly vs One-time Comparison */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                Monthly Expenses by Category
              </Typography>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 250 : isTablet ? 280 : 300}
              >
                <BarChart
                  data={(expenseSummaryData?.data?.monthlyByCategory || []).map(
                    (cat) => ({
                      category:
                        cat.category.charAt(0).toUpperCase() +
                        cat.category.slice(1),
                      amount: cat.total,
                    }),
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="category"
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 60 : 30}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value) =>
                      `₹${Math.round(value).toLocaleString("en-IN")}`
                    }
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  <Bar dataKey="amount" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Profit Tab */}
      {selectedTab === 5 && (
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Summary Cards */}
          <Grid item xs={6} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${profitMetrics.thisMonthProfit >= 0 ? "#10b981" : "#ef4444"}15 0%, ${profitMetrics.thisMonthProfit >= 0 ? "#10b981" : "#ef4444"}05 100%)`,
                borderLeft: `4px solid ${profitMetrics.thisMonthProfit >= 0 ? "#10b981" : "#ef4444"}`,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor:
                        profitMetrics.thisMonthProfit >= 0
                          ? "#10b981"
                          : "#ef4444",
                      width: 48,
                      height: 48,
                    }}
                  >
                    <ProfitIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant={isMobile ? "h6" : "h5"}
                      sx={{
                        fontWeight: 800,
                        color:
                          profitMetrics.thisMonthProfit >= 0
                            ? "#10b981"
                            : "#ef4444",
                      }}
                    >
                      {profitMetrics.thisMonthProfit >= 0 ? "+" : ""}₹
                      {Math.abs(profitMetrics.thisMonthProfit / 1000).toFixed(
                        1,
                      )}
                      K
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Month Profit
                    </Typography>
                    <Chip
                      size="small"
                      label={`${profitMetrics.profitMarginMonth >= 0 ? "+" : ""}${profitMetrics.profitMarginMonth}% margin`}
                      color={
                        profitMetrics.profitMarginMonth >= 0
                          ? "success"
                          : "error"
                      }
                      sx={{ mt: 0.5, fontSize: "0.65rem" }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${profitMetrics.thisYearProfit >= 0 ? "#8b5cf6" : "#ef4444"}15 0%, ${profitMetrics.thisYearProfit >= 0 ? "#8b5cf6" : "#ef4444"}05 100%)`,
                borderLeft: `4px solid ${profitMetrics.thisYearProfit >= 0 ? "#8b5cf6" : "#ef4444"}`,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor:
                        profitMetrics.thisYearProfit >= 0
                          ? "#8b5cf6"
                          : "#ef4444",
                      width: 48,
                      height: 48,
                    }}
                  >
                    <ProfitIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant={isMobile ? "h6" : "h5"}
                      sx={{
                        fontWeight: 800,
                        color:
                          profitMetrics.thisYearProfit >= 0
                            ? "#8b5cf6"
                            : "#ef4444",
                      }}
                    >
                      {profitMetrics.thisYearProfit >= 0 ? "+" : ""}₹
                      {Math.abs(profitMetrics.thisYearProfit / 1000).toFixed(1)}
                      K
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Year Profit
                    </Typography>
                    <Chip
                      size="small"
                      label={`${profitMetrics.profitMarginYear >= 0 ? "+" : ""}${profitMetrics.profitMarginYear}% margin`}
                      color={
                        profitMetrics.profitMarginYear >= 0
                          ? "success"
                          : "error"
                      }
                      sx={{ mt: 0.5, fontSize: "0.65rem" }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card
              sx={{
                background:
                  "linear-gradient(135deg, #10b98115 0%, #10b98105 100%)",
                borderLeft: "4px solid #10b981",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#10b981", width: 48, height: 48 }}>
                    <RevenueIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant={isMobile ? "h6" : "h5"}
                      sx={{ fontWeight: 800, color: "#10b981" }}
                    >
                      ₹{(revenueMetrics.thisYear / 1000).toFixed(1)}K
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Year Revenue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card
              sx={{
                background:
                  "linear-gradient(135deg, #ef444415 0%, #ef444405 100%)",
                borderLeft: "4px solid #ef4444",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#ef4444", width: 48, height: 48 }}>
                    <ExpenseIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant={isMobile ? "h6" : "h5"}
                      sx={{ fontWeight: 800, color: "#ef4444" }}
                    >
                      ₹{(profitMetrics.yearlyExpense / 1000).toFixed(1)}K
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Year Expenses
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ₹{(profitMetrics.monthlyExpense / 1000).toFixed(1)}K/mo
                      recurring
                      {profitMetrics.oneTimeExpenseYear > 0 &&
                        ` + ₹${(profitMetrics.oneTimeExpenseYear / 1000).toFixed(1)}K one-time`}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Revenue vs Expenses vs Profit Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                📊 Revenue vs Expenses vs Profit — Last 12 Months
              </Typography>
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 300 : isTablet ? 350 : 400}
              >
                <ComposedChart data={profitMetrics.monthlyTrend}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 9 : 11 }}
                    angle={isMobile ? -45 : -20}
                    textAnchor="end"
                    height={isMobile ? 60 : 45}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `₹${Math.round(value).toLocaleString("en-IN")}`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "13px",
                      color: "#f1f5f9",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    opacity={0.85}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    opacity={0.85}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke="#a78bfa"
                    strokeWidth={3}
                    fill="url(#profitGrad)"
                    dot={{ fill: "#a78bfa", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Detailed breakdown & insights */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                📋 Profit Breakdown Summary
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  {
                    label: "Monthly Revenue",
                    value: profitMetrics.thisMonthRevenue,
                    color: "#10b981",
                  },
                  {
                    label: "Recurring Expenses",
                    value: profitMetrics.monthlyExpense,
                    color: "#ef4444",
                    negate: true,
                  },
                  ...(profitMetrics.oneTimeExpenseMonth > 0
                    ? [
                        {
                          label: "One-time Expenses (this month)",
                          value: profitMetrics.oneTimeExpenseMonth,
                          color: "#f59e0b",
                          negate: true,
                        },
                      ]
                    : []),
                  {
                    label: "Monthly Net Profit",
                    value: profitMetrics.thisMonthProfit,
                    color:
                      profitMetrics.thisMonthProfit >= 0
                        ? "#8b5cf6"
                        : "#ef4444",
                    bold: true,
                  },
                  { label: "divider" },
                  {
                    label: "Yearly Revenue (this year)",
                    value: revenueMetrics.thisYear,
                    color: "#10b981",
                  },
                  {
                    label: "Recurring Expenses × 12",
                    value: profitMetrics.monthlyExpense * 12,
                    color: "#ef4444",
                    negate: true,
                  },
                  ...(profitMetrics.oneTimeExpenseYear > 0
                    ? [
                        {
                          label: "One-time Expenses (this year)",
                          value: profitMetrics.oneTimeExpenseYear,
                          color: "#f59e0b",
                          negate: true,
                        },
                      ]
                    : []),
                  {
                    label: "Yearly Net Profit",
                    value: profitMetrics.thisYearProfit,
                    color:
                      profitMetrics.thisYearProfit >= 0 ? "#8b5cf6" : "#ef4444",
                    bold: true,
                  },
                ].map((row, i) => {
                  if (row.label === "divider")
                    return (
                      <Box
                        key={i}
                        sx={{
                          borderTop: "1px dashed",
                          borderColor: "divider",
                          my: 0.5,
                        }}
                      />
                    );
                  return (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: row.bold ? 1.5 : 1,
                        borderRadius: 2,
                        bgcolor: row.bold ? `${row.color}10` : "transparent",
                        border: row.bold ? `1px solid ${row.color}30` : "none",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: row.bold ? 700 : 500,
                          color: row.bold ? row.color : "text.secondary",
                        }}
                      >
                        {row.label}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: row.bold ? 800 : 600,
                          color: row.color,
                        }}
                      >
                        {row.negate ? "−" : row.value >= 0 ? "+" : ""}₹
                        {Math.abs(row.value).toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Grid>

          {/* Profit insights */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: "100%" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                💡 Profit Insights
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderLeft: "4px solid",
                    borderColor:
                      profitMetrics.thisMonthProfit >= 0
                        ? "success.main"
                        : "error.main",
                    bgcolor:
                      profitMetrics.thisMonthProfit >= 0
                        ? "success.50"
                        : "error.50",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      color:
                        profitMetrics.thisMonthProfit >= 0
                          ? "success.dark"
                          : "error.dark",
                    }}
                  >
                    {profitMetrics.thisMonthProfit >= 0
                      ? "✅ Profitable Month"
                      : "⚠️ Loss-Making Month"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profitMetrics.thisMonthProfit >= 0
                      ? `This month you're earning ₹${profitMetrics.thisMonthProfit.toLocaleString("en-IN", { maximumFractionDigits: 0 })} over expenses — a ${profitMetrics.profitMarginMonth}% profit margin.`
                      : `Expenses exceed revenue by ₹${Math.abs(profitMetrics.thisMonthProfit).toLocaleString("en-IN", { maximumFractionDigits: 0 })} this month. You need ₹${profitMetrics.thisMonthTotalExpense.toLocaleString("en-IN", { maximumFractionDigits: 0 })} in revenue to break even (₹${profitMetrics.monthlyExpense.toLocaleString("en-IN", { maximumFractionDigits: 0 })} recurring${profitMetrics.oneTimeExpenseMonth > 0 ? ` + ₹${profitMetrics.oneTimeExpenseMonth.toLocaleString("en-IN", { maximumFractionDigits: 0 })} one-time` : ""}).`}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderLeft: "4px solid",
                    borderColor:
                      profitMetrics.thisYearProfit >= 0
                        ? "primary.main"
                        : "error.main",
                    bgcolor:
                      profitMetrics.thisYearProfit >= 0
                        ? "primary.50"
                        : "error.50",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      color:
                        profitMetrics.thisYearProfit >= 0
                          ? "primary.dark"
                          : "error.dark",
                    }}
                  >
                    {profitMetrics.thisYearProfit >= 0
                      ? "📈 Positive Annual Outlook"
                      : "📉 Annual Losses"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profitMetrics.thisYearProfit >= 0
                      ? `Estimated annual profit is ₹${profitMetrics.thisYearProfit.toLocaleString("en-IN", { maximumFractionDigits: 0 })} (${profitMetrics.profitMarginYear}% margin) based on this year's revenue vs monthly expenses annualised.`
                      : `Annual expenses (₹${profitMetrics.yearlyExpense.toLocaleString("en-IN", { maximumFractionDigits: 0 })}) outpace this year's revenue (₹${revenueMetrics.thisYear.toLocaleString("en-IN", { maximumFractionDigits: 0 })}). You need ${Math.ceil(profitMetrics.monthlyExpense / (revenueMetrics.thisYear / 12 || 1))} more bookings to break even.`}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderLeft: "4px solid #f59e0b",
                    bgcolor: "warning.50",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 0.5, color: "warning.dark" }}
                  >
                    🎯 Break-even Target
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You need{" "}
                    <strong>
                      ₹
                      {profitMetrics.thisMonthTotalExpense.toLocaleString(
                        "en-IN",
                        { maximumFractionDigits: 0 },
                      )}
                    </strong>{" "}
                    in monthly revenue to break even (₹
                    {profitMetrics.monthlyExpense.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    recurring
                    {profitMetrics.oneTimeExpenseMonth > 0
                      ? ` + ₹${profitMetrics.oneTimeExpenseMonth.toLocaleString("en-IN", { maximumFractionDigits: 0 })} one-time`
                      : ""}
                    ). Current average booking value of{" "}
                    <strong>
                      ₹
                      {bookingsData?.count > 0
                        ? Math.round(
                            revenueMetrics.total / bookingsData.count,
                          ).toLocaleString("en-IN")
                        : 0}
                    </strong>{" "}
                    means you need approximately{" "}
                    <strong>
                      {bookingsData?.count > 0 && revenueMetrics.total > 0
                        ? Math.ceil(
                            profitMetrics.thisMonthTotalExpense /
                              (revenueMetrics.total / bookingsData.count),
                          )
                        : "—"}
                    </strong>{" "}
                    bookings per month to cover costs.
                  </Typography>
                </Box>

                {profitMetrics.monthlyTrend.length > 0 &&
                  (() => {
                    const profitable = profitMetrics.monthlyTrend.filter(
                      (m) => m.profit > 0,
                    ).length;
                    return (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          borderLeft: "4px solid #8b5cf6",
                          bgcolor: "primary.50",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            mb: 0.5,
                            color: "primary.dark",
                          }}
                        >
                          📅 Profitable Months (Last 12)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {profitable} out of 12 months were profitable.{" "}
                          {profitable >= 8
                            ? "Strong consistent performance!"
                            : profitable >= 4
                              ? "Mixed results — focus on low-revenue months."
                              : "Needs attention — review expense structure or boost bookings."}
                        </Typography>
                      </Box>
                    );
                  })()}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Box sx={{ mt: { xs: 3, md: 4 }, px: { xs: 1, sm: 0 } }}>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          gutterBottom
          sx={{
            mb: 2,
            fontWeight: 600,
            fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
          }}
        >
          Welcome to KMK Hall & Banquets
        </Typography>
        <Typography
          variant={isMobile ? "body2" : "body1"}
          color="text.secondary"
          sx={{ fontSize: { xs: "0.875rem", sm: "0.95rem", md: "1rem" } }}
        >
          Premium Event Management System - Track your revenue, analyze trends,
          and make data-driven decisions to grow your business.
        </Typography>
      </Box>
    </Box>
  );
}

export default Dashboard;
