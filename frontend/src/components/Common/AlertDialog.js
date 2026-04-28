import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

/**
 * Reusable Alert Dialog Component
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onClose - Function to call when dialog is closed
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} type - Type of alert: 'success', 'error', 'warning', 'info', 'confirm'
 * @param {function} onConfirm - Function to call when user confirms (for confirm type)
 * @param {string} confirmText - Text for confirm button (default: 'OK' or 'Confirm')
 * @param {string} cancelText - Text for cancel button (default: 'Cancel')
 */
function AlertDialog({
  open,
  onClose,
  title,
  message,
  type = "info",
  onConfirm,
  confirmText,
  cancelText = "Cancel",
  details,
}) {
  const isConfirm = type === "confirm";

  const getIcon = () => {
    switch (type) {
      case "success":
        return <SuccessIcon sx={{ fontSize: 48, color: "success.main" }} />;
      case "error":
        return <ErrorIcon sx={{ fontSize: 48, color: "error.main" }} />;
      case "warning":
        return <WarningIcon sx={{ fontSize: 48, color: "warning.main" }} />;
      case "info":
      default:
        return <InfoIcon sx={{ fontSize: 48, color: "info.main" }} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return "success.main";
      case "error":
        return "error.main";
      case "warning":
        return "warning.main";
      case "info":
      case "confirm":
      default:
        return "info.main";
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: { xs: 280, sm: 400 },
          maxWidth: 600,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          pb: 1,
          color: getColor(),
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {title ||
          (type === "confirm"
            ? "Confirm"
            : type.charAt(0).toUpperCase() + type.slice(1))}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 2,
          }}
        >
          {getIcon()}
          <DialogContentText
            sx={{
              textAlign: "center",
              fontSize: "1rem",
              color: "text.primary",
            }}
          >
            {message}
          </DialogContentText>
          {details &&
            (typeof details !== "string" || details.trim() !== "") && (
              <Box
                sx={{
                  bgcolor: "grey.50",
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                  width: "100%",
                }}
              >
                {details}
              </Box>
            )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "center", gap: 1 }}>
        {isConfirm && (
          <Button onClick={onClose} variant="outlined" sx={{ minWidth: 100 }}>
            {cancelText}
          </Button>
        )}
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={type === "error" || type === "warning" ? type : "primary"}
          autoFocus
          sx={{ minWidth: 100 }}
        >
          {confirmText || (isConfirm ? "Confirm" : "OK")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AlertDialog;
