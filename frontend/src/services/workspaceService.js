import api from "./api";

// Packages
export const packageService = {
  getAll: (params) => api.get("/workspace/packages", { params }),
  getById: (id) => api.get(`/workspace/packages/${id}`),
  create: (data) => api.post("/workspace/packages", data),
  update: (id, data) => api.put(`/workspace/packages/${id}`, data),
  delete: (id) => api.delete(`/workspace/packages/${id}`),
  calculate: (data) => api.post("/workspace/packages/calculate", data),
};

// Bookings
export const bookingService = {
  getAll: (params) => api.get("/workspace/bookings", { params }),
  getById: (id) => api.get(`/workspace/bookings/${id}`),
  getByNumber: (bookingNumber) =>
    api.get(`/workspace/bookings/number/${bookingNumber}`),
  create: (data) => api.post("/workspace/bookings", data),
  update: (id, data) => api.put(`/workspace/bookings/${id}`, data),
  updateStatus: (id, status) =>
    api.put(`/workspace/bookings/${id}/status`, { status }),
  recordPayment: (id, amount) =>
    api.put(`/workspace/bookings/${id}/record-payment`, { amount }),
  delete: (id) => api.delete(`/workspace/bookings/${id}`),
  calculate: (data) => api.post("/workspace/bookings/calculate", data),
};

// Customers
export const customerService = {
  getAll: (params) => api.get("/workspace/customers", { params }),
  getById: (id) => api.get(`/workspace/customers/${id}`),
  getByPhone: (phone) => api.get(`/workspace/customers/phone/${phone}`),
  getStats: (id) => api.get(`/workspace/customers/${id}/stats`),
  search: (query) =>
    api.get("/workspace/customers/search", { params: { query } }),
  create: (data) => api.post("/workspace/customers", data),
  update: (id, data) => api.put(`/workspace/customers/${id}`, data),
  delete: (id) => api.delete(`/workspace/customers/${id}`),
};

const services = {
  packageService,
  bookingService,
  customerService,
};

export default services;
