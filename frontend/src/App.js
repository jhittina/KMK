import React, { useState, useMemo, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import { AuthProvider } from "./context/AuthContext";

// Auth Pages
import Login from "./pages/Login";

// Self Service Pages
import Categories from "./pages/Config/Categories";
import Items from "./pages/Config/Items";
import Expenses from "./pages/Config/Expenses";

// Workspace Profile Pages
import Packages from "./pages/Workspace/Packages";
import PackageBuilder from "./pages/Workspace/PackageBuilder";
import Bookings from "./pages/Workspace/Bookings";
import CreateBooking from "./pages/Workspace/CreateBooking";
import EditBooking from "./pages/Workspace/EditBooking";
import BookingDetails from "./pages/Workspace/BookingDetails";
import Customers from "./pages/Workspace/Customers";
import CustomerDetails from "./pages/Workspace/CustomerDetails";

// Dashboard
import Dashboard from "./pages/Dashboard";

// Create color mode context
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

// Create React Query client with optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
      refetchOnMount: false, // Don't refetch if data is fresh
      refetchOnReconnect: false, // Don't refetch on reconnect if data is fresh
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  const [mode, setMode] = useState("dark");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    [],
  );

  // Create Material UI theme with dark mode support
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === "dark" ? "#a78bfa" : "#8b5cf6",
            light: "#c4b5fd",
            dark: "#7c3aed",
          },
          secondary: {
            main: mode === "dark" ? "#f472b6" : "#ec4899",
            light: "#f9a8d4",
            dark: "#db2777",
          },
          success: {
            main: "#10b981",
          },
          error: {
            main: "#ef4444",
          },
          warning: {
            main: "#f59e0b",
          },
          background: {
            default: mode === "dark" ? "#0f172a" : "#f8fafc",
            paper: mode === "dark" ? "#1e293b" : "#ffffff",
          },
        },
        typography: {
          fontFamily:
            '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          fontSize: 15,
          h1: {
            fontSize: "3rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
          },
          h2: {
            fontSize: "2.5rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          },
          h3: {
            fontSize: "2rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
          },
          h4: {
            fontSize: "1.75rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
          },
          h5: {
            fontSize: "1.5rem",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: 1.4,
          },
          h6: {
            fontSize: "1.25rem",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: 1.4,
          },
          subtitle1: {
            fontSize: "1.125rem",
            fontWeight: 500,
            lineHeight: 1.5,
          },
          subtitle2: {
            fontSize: "1rem",
            fontWeight: 500,
            lineHeight: 1.5,
          },
          body1: {
            fontSize: "1rem",
            fontWeight: 400,
            lineHeight: 1.6,
          },
          body2: {
            fontSize: "0.925rem",
            fontWeight: 400,
            lineHeight: 1.6,
          },
          button: {
            fontWeight: 600,
            fontSize: "0.95rem",
            letterSpacing: "0.01em",
            textTransform: "none",
          },
          caption: {
            fontSize: "0.825rem",
            fontWeight: 400,
            lineHeight: 1.5,
          },
          overline: {
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1.5,
          },
        },
        shape: {
          borderRadius: 12,
        },
        shadows: [
          "none",
          mode === "dark"
            ? "0 1px 2px 0 rgb(0 0 0 / 0.3)"
            : "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          mode === "dark"
            ? "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)"
            : "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          mode === "dark"
            ? "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)"
            : "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          mode === "dark"
            ? "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)"
            : "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          mode === "dark"
            ? "0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)"
            : "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          ...Array(19).fill(
            mode === "dark"
              ? "0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)"
              : "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          ),
        ],
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: 10,
                padding: "10px 20px",
                letterSpacing: "0.01em",
              },
              contained: {
                boxShadow: "none",
                "&:hover": {
                  boxShadow:
                    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                },
              },
              sizeSmall: {
                padding: "6px 14px",
                fontSize: "0.875rem",
              },
              sizeLarge: {
                padding: "12px 24px",
                fontSize: "1rem",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow:
                  mode === "dark"
                    ? "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)"
                    : "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
              rounded: {
                borderRadius: 12,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
                fontSize: "0.875rem",
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom:
                  mode === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.12)"
                    : "1px solid rgba(224, 224, 224, 1)",
                fontSize: "0.95rem",
                padding: "14px 16px",
              },
              head: {
                fontWeight: 600,
                fontSize: "0.925rem",
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiInputBase-root": {
                  fontSize: "0.95rem",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.95rem",
                },
                // Style date/time inputs
                '& input[type="date"], & input[type="datetime-local"], & input[type="time"]':
                  {
                    colorScheme: mode === "dark" ? "dark" : "light",
                    "&::-webkit-calendar-picker-indicator": {
                      filter: mode === "dark" ? "invert(0.8)" : "none",
                      cursor: "pointer",
                      borderRadius: "4px",
                      padding: "4px",
                      "&:hover": {
                        backgroundColor:
                          mode === "dark"
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.05)",
                      },
                    },
                  },
              },
            },
          },
          MuiInputBase: {
            styleOverrides: {
              root: {
                fontSize: "0.95rem",
              },
              input: {
                fontSize: "0.95rem",
              },
            },
          },
          MuiSelect: {
            styleOverrides: {
              select: {
                fontSize: "0.95rem",
              },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                fontSize: "0.95rem",
              },
            },
          },
        },
      }),
    [mode],
  );
  return (
    <ColorModeContext.Provider value={colorMode}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<RoleBasedRedirect />} />
                          <Route
                            path="/dashboard"
                            element={
                              <ProtectedRoute adminOnly>
                                <Dashboard />
                              </ProtectedRoute>
                            }
                          />

                          {/* Self Service Routes - Admin Only */}
                          <Route
                            path="/config/categories"
                            element={
                              <ProtectedRoute adminOnly>
                                <Categories />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/config/items"
                            element={
                              <ProtectedRoute adminOnly>
                                <Items />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/config/expenses"
                            element={
                              <ProtectedRoute>
                                <Expenses />
                              </ProtectedRoute>
                            }
                          />

                          {/* Workspace Profile Routes - All Authenticated Users */}
                          <Route
                            path="/workspace/packages"
                            element={<Packages />}
                          />
                          <Route
                            path="/workspace/packages/new"
                            element={<PackageBuilder />}
                          />
                          <Route
                            path="/workspace/packages/edit/:id"
                            element={<PackageBuilder />}
                          />

                          <Route
                            path="/workspace/bookings"
                            element={<Bookings />}
                          />
                          <Route
                            path="/workspace/bookings/new"
                            element={<CreateBooking />}
                          />
                          <Route
                            path="/workspace/bookings/:id/edit"
                            element={<EditBooking />}
                          />
                          <Route
                            path="/workspace/bookings/:id"
                            element={<BookingDetails />}
                          />

                          <Route
                            path="/workspace/customers"
                            element={<Customers />}
                          />
                          <Route
                            path="/workspace/customers/:id"
                            element={<CustomerDetails />}
                          />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </AuthProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
