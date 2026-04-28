import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  LocalOffer as PackageIcon,
  EventNote as BookingIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AttachMoney as ExpenseIcon,
} from "@mui/icons-material";
import { ColorModeContext } from "../../App";
import { useAuth } from "../../context/AuthContext";

const drawerWidth = 280;

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    divider: true,
    title: "Self Service",
  },
  {
    text: "Categories",
    icon: <CategoryIcon />,
    path: "/config/categories",
  },
  {
    text: "Items",
    icon: <InventoryIcon />,
    path: "/config/items",
  },
  {
    text: "Maintenance",
    icon: <ExpenseIcon />,
    path: "/config/maintenance",
  },
  {
    divider: true,
    title: "Workspace",
  },
  {
    text: "Packages",
    icon: <PackageIcon />,
    path: "/workspace/packages",
  },
  {
    text: "Bookings",
    icon: <BookingIcon />,
    path: "/workspace/bookings",
  },
  {
    text: "Customers",
    icon: <PeopleIcon />,
    path: "/workspace/customers",
  },
];

function Layout({ children }) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { user, logout, isAdmin } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    // Show all items to admin
    if (isAdmin()) return true;

    // Hide Self Service items for staff
    if (item.title === "Self Service" || item.path?.startsWith("/config")) {
      return false;
    }

    return true;
  });

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)"
            : "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
      }}
    >
      <Box
        sx={{
          p: 3,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)"
              : "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)",
            pointerEvents: "none",
          },
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: "3rem",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              lineHeight: 1,
            }}
          >
            💍
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.9)",
            fontWeight: 500,
            position: "relative",
            zIndex: 1,
            mt: 1.5,
            display: "block",
            textAlign: "center",
          }}
        >
          KMK Hall & Banquets
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.9)",
            fontWeight: 500,
            position: "relative",
            zIndex: 1,
            mt: 0.5,
            display: "block",
            textAlign: "center",
            fontSize: "0.7rem",
          }}
        >
          Premium Event Management
        </Typography>
      </Box>
      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {filteredMenuItems.map((item, index) => {
          if (item.divider) {
            return (
              <Box key={index}>
                <Divider
                  sx={{
                    my: 2,
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "rgba(139, 92, 246, 0.2)"
                        : "rgba(139, 92, 246, 0.1)",
                  }}
                />
                {item.title && (
                  <Box sx={{ px: 2, mb: 1 }}>
                    <Typography
                      variant="overline"
                      sx={{
                        color:
                          theme.palette.mode === "dark"
                            ? "rgba(167, 139, 250, 0.8)"
                            : "rgba(124, 58, 237, 0.7)",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          }

          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    background: isActive
                      ? "linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)"
                      : "transparent",
                    borderRadius: "0 4px 4px 0",
                    transition: "all 0.3s",
                  },
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(139, 92, 246, 0.15)"
                        : "rgba(139, 92, 246, 0.08)",
                    transform: "translateX(4px)",
                    "&::before": {
                      width: "4px",
                      background:
                        "linear-gradient(180deg, #a78bfa 0%, #f472b6 100%)",
                    },
                  },
                  "&.Mui-selected": {
                    background:
                      theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(236, 72, 153, 0.2) 100%)"
                        : "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 4px 12px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                        : "0 4px 12px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.5)",
                    "&:hover": {
                      background:
                        theme.palette.mode === "dark"
                          ? "linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(236, 72, 153, 0.3) 100%)"
                          : "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.15) 100%)",
                    },
                    "& .MuiListItemIcon-root": {
                      color: theme.palette.primary.main,
                    },
                    "& .MuiListItemText-primary": {
                      fontWeight: 700,
                      color:
                        theme.palette.mode === "dark"
                          ? theme.palette.primary.light
                          : theme.palette.primary.dark,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive
                      ? theme.palette.primary.main
                      : theme.palette.mode === "dark"
                        ? "rgba(167, 139, 250, 0.7)"
                        : "rgba(124, 58, 237, 0.6)",
                    transition: "all 0.3s",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "1rem",
                    letterSpacing: "-0.01em",
                    color: isActive
                      ? theme.palette.mode === "dark"
                        ? theme.palette.primary.light
                        : theme.palette.primary.dark
                      : theme.palette.text.primary,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${
            theme.palette.mode === "dark"
              ? "rgba(139, 92, 246, 0.2)"
              : "rgba(139, 92, 246, 0.1)"
          }`,
          background:
            theme.palette.mode === "dark"
              ? "rgba(30, 27, 75, 0.5)"
              : "rgba(248, 250, 252, 0.8)",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            display: "block",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          © 2026 KMK Hall & Banquets
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background:
            theme.palette.mode === "dark"
              ? "rgba(30, 27, 75, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${
            theme.palette.mode === "dark"
              ? "rgba(139, 92, 246, 0.2)"
              : "rgba(139, 92, 246, 0.1)"
          }`,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 4px 24px rgba(0, 0, 0, 0.2)"
              : "0 4px 24px rgba(139, 92, 246, 0.05)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { md: "none" },
              color:
                theme.palette.mode === "dark"
                  ? "white"
                  : theme.palette.primary.main,
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)"
                  : "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.25rem" },
            }}
          >
            {isMobile
              ? "KMK Hall & Banquets"
              : "KMK Hall & Banquets - Event Management"}
          </Typography>
          <Tooltip
            title={`Switch to ${theme.palette.mode === "dark" ? "light" : "dark"} mode`}
          >
            <IconButton
              onClick={colorMode.toggleColorMode}
              size="medium"
              sx={{
                mr: 1,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.primary.light
                    : theme.palette.primary.main,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(139, 92, 246, 0.1)"
                    : "rgba(139, 92, 246, 0.05)",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(139, 92, 246, 0.2)"
                      : "rgba(139, 92, 246, 0.1)",
                },
              }}
            >
              {theme.palette.mode === "dark" ? (
                <LightModeIcon />
              ) : (
                <DarkModeIcon />
              )}
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="Account">
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.primary.light
                    : theme.palette.primary.main,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(139, 92, 246, 0.1)"
                    : "rgba(139, 92, 246, 0.05)",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(139, 92, 246, 0.2)"
                      : "rgba(139, 92, 246, 0.1)",
                },
              }}
            >
              <PersonIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
              },
            }}
          >
            <Box
              sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                {user?.email}
              </Typography>
              <Chip
                label={user?.role?.toUpperCase()}
                size="small"
                color="primary"
                sx={{ mt: 0.5, fontSize: "0.7rem", height: 20 }}
              />
            </Box>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "none",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "4px 0 24px rgba(0, 0, 0, 0.5)"
                  : "4px 0 24px rgba(139, 92, 246, 0.1)",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: `1px solid ${
                theme.palette.mode === "dark"
                  ? "rgba(139, 92, 246, 0.2)"
                  : "rgba(139, 92, 246, 0.1)"
              }`,
              boxShadow:
                theme.palette.mode === "dark"
                  ? "4px 0 24px rgba(0, 0, 0, 0.3)"
                  : "4px 0 24px rgba(139, 92, 246, 0.05)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 2.5, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.background.default
              : "#f8fafc",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
