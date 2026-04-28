export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status) => {
  const colors = {
    draft: "default",
    confirmed: "primary",
    completed: "success",
    cancelled: "error",
  };
  return colors[status] || "default";
};

export const getPriceTypeLabel = (priceType) => {
  const labels = {
    per_person: "Per Person",
    flat_rate: "Flat Rate",
    per_hour: "Per Hour",
  };
  return labels[priceType] || priceType;
};
