import api from "./api";

// Categories
export const categoryService = {
  getAll: (params) => api.get("/config/categories", { params }),
  getById: (id) => api.get(`/config/categories/${id}`),
  create: (data) => api.post("/config/categories", data),
  update: (id, data) => api.put(`/config/categories/${id}`, data),
  delete: (id) => api.delete(`/config/categories/${id}`),
  addSubcategory: (id, data) =>
    api.post(`/config/categories/${id}/subcategories`, data),
};

// Items
export const itemService = {
  getAll: (params) => api.get("/config/items", { params }),
  getById: (id) => api.get(`/config/items/${id}`),
  getByCategory: (category, params) =>
    api.get(`/config/items/category/${category}`, { params }),
  getCategories: () => api.get("/config/items/categories"),
  create: (data) => api.post("/config/items", data),
  update: (id, data) => api.put(`/config/items/${id}`, data),
  delete: (id) => api.delete(`/config/items/${id}`),
};

// Expenses
export const expenseService = {
  getAll: (params) => api.get("/config/expenses", { params }),
  getById: (id) => api.get(`/config/expenses/${id}`),
  getSummary: (params) => api.get("/config/expenses/summary", { params }),
  create: (data) => api.post("/config/expenses", data),
  update: (id, data) => api.put(`/config/expenses/${id}`, data),
  delete: (id) => api.delete(`/config/expenses/${id}`),
  markAsPaid: (id) => api.put(`/config/expenses/${id}/mark-paid`),
  recordPayment: (id, amount) =>
    api.put(`/config/expenses/${id}/record-payment`, { amount }),
  toggleActive: (id) => api.put(`/config/expenses/${id}/toggle-active`),
};

const services = {
  categoryService,
  itemService,
  expenseService,
};

export default services;
