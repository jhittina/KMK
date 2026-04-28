import { useState } from "react";

/**
 * Custom hook for managing alert dialogs
 * @returns {object} - Alert state and functions
 */
export const useAlert = () => {
  const [alertState, setAlertState] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "",
    cancelText: "Cancel",
    details: null,
  });

  const showAlert = ({
    type = "info",
    title,
    message,
    onConfirm,
    confirmText,
    cancelText = "Cancel",
    details,
  }) => {
    setAlertState({
      open: true,
      type,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      details,
    });
  };

  const showSuccess = (message, title = "Success") => {
    showAlert({ type: "success", title, message });
  };

  const showError = (message, title = "Error") => {
    showAlert({ type: "error", title, message });
  };

  const showWarning = (message, title = "Warning") => {
    showAlert({ type: "warning", title, message });
  };

  const showInfo = (message, title = "Information") => {
    showAlert({ type: "info", title, message });
  };

  const showConfirm = (
    message,
    onConfirm,
    title = "Confirm",
    confirmText = "Confirm",
    cancelText = "Cancel",
    details = null,
  ) => {
    showAlert({
      type: "confirm",
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      details,
    });
  };

  const hideAlert = () => {
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  return {
    alertState,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    hideAlert,
  };
};
