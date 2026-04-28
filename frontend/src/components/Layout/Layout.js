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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { ColorModeContext } from "../../App";
import { useAuth } from "../../context/AuthContext";

const DRAWER_FULL = 260;
const DRAWER_MINI = 64;

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
    adminOnly: true,
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
    text: "Expenses",
    icon: <ExpenseIcon />,
    path: "/config/expenses",
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
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const drawerWidth = collapsed ? DRAWER_MINI : DRAWER_FULL;
  const isDark = theme.palette.mode === "dark";

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleCollapseToggle = () => setCollapsed((c) => !c);

  const handleUserMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleUserMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly && !isAdmin()) return false;
    if (isAdmin()) return true;
    if (item.title === "Self Service" || item.path?.startsWith("/config"))
      return false;
    return true;
  });

  // Shared drawer content — accepts collapsed prop (always false on mobile)
  const DrawerContent = ({ mini = false }) => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: isDark
          ? "linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)"
          : "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: isDark
            ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)"
            : "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)",
          position: "relative",
          overflow: "hidden",
          py: mini ? 1.5 : 2.5,
          px: mini ? 0 : 3,
          display: "flex",
          alignItems: "center",
          justifyContent: mini ? "center" : "flex-start",
          gap: mini ? 0 : 1.5,
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
        <Typography
          sx={{
            fontSize: mini ? "1.6rem" : "2.2rem",
            lineHeight: 1,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            position: "relative",
            zIndex: 1,
          }}
        >
          💍
        </Typography>
        {!mini && (
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: "white", fontWeight: 700, lineHeight: 1.2 }}
            >
              KMK Hall & Banquets
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.68rem" }}
            >
              Premium Event Management
            </Typography>
          </Box>
        )}
      </Box>

      {/* Nav List */}
      <List
        sx={{
          px: mini ? 0.5 : 1.5,
          py: 1.5,
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {filteredMenuItems.map((item, index) => {
          if (item.divider) {
            return (
              <Box key={index}>
                <Divider
                  sx={{
                    my: 1.5,
                    borderColor: isDark
                      ? "rgba(139,92,246,0.2)"
                      : "rgba(139,92,246,0.12)",
                  }}
                />
                {item.title && !mini && (
                  <Box sx={{ px: 2, mb: 0.5 }}>
                    <Typography
                      variant="overline"
                      sx={{
                        color: isDark
                          ? "rgba(167,139,250,0.8)"
                          : "rgba(124,58,237,0.7)",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        letterSpacing: "0.1em",
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
            <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
              <Tooltip title={mini ? item.text : ""} placement="right" arrow>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    py: 1.25,
                    px: mini ? 1.5 : 1.75,
                    justifyContent: mini ? "center" : "flex-start",
                    minHeight: 44,
                    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: isActive ? "3px" : "0px",
                      background:
                        "linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)",
                      borderRadius: "0 4px 4px 0",
                      transition: "width 0.25s",
                    },
                    "&:hover": {
                      backgroundColor: isDark
                        ? "rgba(139,92,246,0.15)"
                        : "rgba(139,92,246,0.08)",
                      transform: mini ? "none" : "translateX(3px)",
                      "&::before": {
                        width: "3px",
                        background:
                          "linear-gradient(180deg, #a78bfa 0%, #f472b6 100%)",
                      },
                    },
                    "&.Mui-selected": {
                      background: isDark
                        ? "linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(236,72,153,0.2) 100%)"
                        : "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.1) 100%)",
                      boxShadow: isDark
                        ? "0 4px 12px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                        : "0 4px 12px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.5)",
                      "&:hover": {
                        background: isDark
                          ? "linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(236,72,153,0.3) 100%)"
                          : "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.15) 100%)",
                      },
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: mini ? 0 : 38,
                      mr: mini ? 0 : 0.5,
                      color: isActive
                        ? theme.palette.primary.main
                        : isDark
                          ? "rgba(167,139,250,0.7)"
                          : "rgba(124,58,237,0.6)",
                      transition: "color 0.25s",
                      "& svg": { fontSize: "1.3rem" },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!mini && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 700 : 500,
                        fontSize: "0.9rem",
                        noWrap: true,
                        color: isActive
                          ? isDark
                            ? theme.palette.primary.light
                            : theme.palette.primary.dark
                          : theme.palette.text.primary,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      {!mini && (
        <Box
          sx={{
            p: 1.5,
            borderTop: `1px solid ${isDark ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.1)"}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "block",
              textAlign: "center",
              fontWeight: 500,
              fontSize: "0.68rem",
            }}
          >
            © 2026 KMK Hall & Banquets
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          transition: "width 0.3s ease, margin 0.3s ease",
          background: isDark ? "rgba(30,27,75,0.95)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${isDark ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.1)"}`,
          boxShadow: isDark
            ? "0 4px 24px rgba(0,0,0,0.2)"
            : "0 4px 24px rgba(139,92,246,0.05)",
        }}
      >
        <Toolbar>
          {/* Mobile hamburger */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { md: "none" },
              color: isDark ? "white" : theme.palette.primary.main,
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: isDark
                ? "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)"
                : "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.2rem" },
            }}
          >
            {isMobile
              ? "KMK Hall & Banquets"
              : "KMK Hall & Banquets — Event Management"}
          </Typography>

          {/* Dark mode toggle */}
          <Tooltip title={`Switch to ${isDark ? "light" : "dark"} mode`}>
            <IconButton
              onClick={colorMode.toggleColorMode}
              size="medium"
              sx={{
                mr: 1,
                color: isDark
                  ? theme.palette.primary.light
                  : theme.palette.primary.main,
                bgcolor: isDark
                  ? "rgba(139,92,246,0.1)"
                  : "rgba(139,92,246,0.05)",
                "&:hover": {
                  bgcolor: isDark
                    ? "rgba(139,92,246,0.2)"
                    : "rgba(139,92,246,0.1)",
                },
              }}
            >
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* User menu */}
          <Tooltip title="Account">
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{
                color: isDark
                  ? theme.palette.primary.light
                  : theme.palette.primary.main,
                bgcolor: isDark
                  ? "rgba(139,92,246,0.1)"
                  : "rgba(139,92,246,0.05)",
                "&:hover": {
                  bgcolor: isDark
                    ? "rgba(139,92,246,0.2)"
                    : "rgba(139,92,246,0.1)",
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
            PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}
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

      {/* Nav */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
          transition: "width 0.3s ease",
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_FULL,
              borderRight: "none",
              boxShadow: isDark
                ? "4px 0 24px rgba(0,0,0,0.5)"
                : "4px 0 24px rgba(139,92,246,0.1)",
            },
          }}
        >
          <DrawerContent mini={false} />
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: `1px solid ${isDark ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.1)"}`,
              boxShadow: isDark
                ? "4px 0 24px rgba(0,0,0,0.3)"
                : "4px 0 24px rgba(139,92,246,0.05)",
              overflowX: "hidden",
              transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
            },
          }}
          open
        >
          <DrawerContent mini={collapsed} />

          {/* Collapse toggle button */}
          <Box
            sx={{
              position: "absolute",
              bottom: 56,
              right: collapsed ? "50%" : 12,
              transform: collapsed ? "translateX(50%)" : "none",
              transition: "all 0.3s ease",
              zIndex: 10,
            }}
          >
            <Tooltip
              title={collapsed ? "Expand menu" : "Collapse menu"}
              placement="right"
            >
              <IconButton
                onClick={handleCollapseToggle}
                size="small"
                sx={{
                  bgcolor: isDark
                    ? "rgba(139,92,246,0.15)"
                    : "rgba(139,92,246,0.1)",
                  border: `1px solid ${isDark ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.25)"}`,
                  color: isDark ? "#a78bfa" : "#7c3aed",
                  width: 28,
                  height: 28,
                  "&:hover": {
                    bgcolor: isDark
                      ? "rgba(139,92,246,0.3)"
                      : "rgba(139,92,246,0.2)",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {collapsed ? (
                  <ChevronRightIcon sx={{ fontSize: "1rem" }} />
                ) : (
                  <ChevronLeftIcon sx={{ fontSize: "1rem" }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 2.5, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          transition: "width 0.3s ease",
          backgroundColor: isDark
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
