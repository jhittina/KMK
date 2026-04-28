import React from "react";
import { Alert, AlertTitle, Box, Button } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";

function ErrorMessage({ error, onRetry }) {
  return (
    <Box sx={{ p: 3 }}>
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )
        }
      >
        <AlertTitle>Error</AlertTitle>
        {error?.message || "Something went wrong. Please try again."}
      </Alert>
    </Box>
  );
}

export default ErrorMessage;
