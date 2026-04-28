import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

function Login() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: "100%",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 20px 60px rgba(139, 92, 246, 0.3)"
              : "0 20px 60px rgba(139, 92, 246, 0.15)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)"
                : "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)",
            p: 4,
            textAlign: "center",
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
          <Box
            sx={{
              fontSize: "3.5rem",
              mb: 1,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
            }}
          >
            💍
          </Box>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              fontWeight: 800,
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              position: "relative",
              zIndex: 1,
            }}
          >
            KMK Hall & Banquets
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.95)",
              mt: 1,
              position: "relative",
              zIndex: 1,
            }}
          >
            Event Management System
          </Typography>
        </Box>

        {/* Form */}
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}
          >
            Welcome Back
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 2.5 }}
              autoComplete="email"
              autoFocus
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<LoginIcon />}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                background:
                  "linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #ec4899 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #db2777 100%)",
                },
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo Credentials */}
          <Box
            sx={{
              mt: 4,
              p: 2,
              borderRadius: 2,
              background:
                theme.palette.mode === "dark"
                  ? "rgba(139, 92, 246, 0.1)"
                  : "rgba(139, 92, 246, 0.05)",
              border: `1px solid ${
                theme.palette.mode === "dark"
                  ? "rgba(139, 92, 246, 0.2)"
                  : "rgba(139, 92, 246, 0.15)"
              }`,
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, display: "block", mb: 1 }}
            >
              Demo Credentials:
            </Typography>
            <Typography variant="caption" sx={{ display: "block" }}>
              Admin: admin@kmkhall.com / admin123
            </Typography>
            <Typography variant="caption" sx={{ display: "block" }}>
              Staff: staff@kmkhall.com / staff123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
