import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors and auto-logout on token issues
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle 401 Unauthorized errors (invalid/expired token)
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || "";

      // Check if it's a token-related error
      if (
        errorMessage.includes("token") ||
        errorMessage.includes("expired") ||
        errorMessage.includes("revoked") ||
        errorMessage.includes("invalid")
      ) {
        // Clear local storage and redirect to login
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];

        // Only redirect if not already on login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    // Handle 423 Locked errors (account locked due to failed attempts)
    if (error.response?.status === 423) {
      const message =
        error.response?.data?.message || "Account temporarily locked";
      return Promise.reject(new Error(message));
    }

    // Handle 429 Too Many Requests (rate limiting)
    if (error.response?.status === 429) {
      const message =
        error.response?.data?.message ||
        "Too many requests. Please try again later.";
      return Promise.reject(new Error(message));
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  },
);

export default api;
