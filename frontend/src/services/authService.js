import api from "./api";

export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (name, email, password, role, phone) =>
    api.post("/auth/register", { name, email, password, role, phone }),
  getCurrentUser: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  logoutAll: () => api.post("/auth/logout-all"),
  changePassword: (currentPassword, newPassword) =>
    api.put("/auth/change-password", { currentPassword, newPassword }),
};

export default authService;
