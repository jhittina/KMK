import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  CheckCircle as PaidIcon,
} from "@mui/icons-material";
import {
  useBooking,
  useUpdateBookingStatus,
  useRecordBookingPayment,
} from "../../hooks/useWorkspace";
import Loading from "../../components/Common/Loading";
import ErrorMessage from "../../components/Common/ErrorMessage";
import AlertDialog from "../../components/Common/AlertDialog";
import { useAlert } from "../../hooks/useAlert";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
} from "../../utils/helpers";
import api from "../../services/api";

function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  const { data, isLoading, error, refetch } = useBooking(id);
  const updateStatusMutation = useUpdateBookingStatus();
  const recordPaymentMutation = useRecordBookingPayment();
  const { alertState, showSuccess, showError, hideAlert } = useAlert();

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      showSuccess("Booking status updated successfully");
      // No need for manual refetch - cache invalidation handles it
    } catch (error) {
      showError(error.message || "Failed to update status");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/workspace/bookings/${id}/pdf`, {
        responseType: "blob",
      });

      // Create blob URL and download
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `booking-${booking.bookingNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showError(error.message || "Failed to download PDF");
    }
  };

  const handleOpenPaymentDialog = () => {
    setPaymentAmount("");
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setPaymentAmount("");
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showError("Please enter a valid payment amount", "Validation Error");
      return;
    }

    const amount = parseFloat(paymentAmount);
    const pendingPayment =
      booking.pricing.totalAmount - (booking.pricing.initialPayment || 0);

    if (amount > pendingPayment) {
      showError(
        `Payment amount cannot exceed pending payment of ₹${pendingPayment.toLocaleString("en-IN")}`,
        "Validation Error",
      );
      return;
    }

    try {
      await recordPaymentMutation.mutateAsync({
        id: booking._id,
        amount,
      });
      showSuccess(
        `Payment of ₹${amount.toLocaleString("en-IN")} recorded successfully`,
      );
      handleClosePaymentDialog();
    } catch (error) {
      showError(
        error.response?.data?.error || "Failed to record payment",
        "Error",
      );
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  const booking = data?.data;
  if (!booking) return null;

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/workspace/bookings")}
        >
          Back to Bookings
        </Button>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/workspace/bookings/${id}/edit`)}
          color="primary"
        >
          Edit Booking
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPDF}
          color="success"
        >
          Download PDF
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Booking Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Booking # {booking.bookingNumber}
          </Typography>
        </Box>
        <Chip
          label={booking.status.toUpperCase()}
          color={getStatusColor(booking.status)}
          size="large"
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Customer Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{booking.customer.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">
                  {booking.customer.phone}
                </Typography>
              </Grid>
              {booking.customer.email && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {booking.customer.email}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Event Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Event Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(booking.eventDetails.eventDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Event Type
                </Typography>
                <Typography variant="body1">
                  {booking.eventDetails.eventType}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Venue
                </Typography>
                <Typography variant="body1">
                  {booking.eventDetails.venue}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Guest Count
                </Typography>
                <Typography variant="body1">
                  {booking.eventDetails.guestCount}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Packages & Items
            </Typography>
            {booking.packages && booking.packages.length > 0
              ? booking.packages.map((pkg, pkgIndex) => (
                  <Box key={pkgIndex} sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1, color: "primary.main" }}
                    >
                      {pkg.packageName}{" "}
                      {pkg.packageCategory && `(${pkg.packageCategory})`}
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Price</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pkg.items?.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.itemName}</TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell align="right">
                                {formatCurrency(item.unitPrice || 0)}
                              </TableCell>
                              <TableCell align="right">
                                {formatCurrency(item.totalPrice || 0)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))
              : // Fallback for old booking structure with single package
                booking.package && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {booking.package?.items?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.unitPrice || 0)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.totalPrice || 0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Pricing Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(booking.pricing.subtotal)}
                </Typography>
              </Box>
              {booking.pricing.discountAmount > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                    color: "success.main",
                  }}
                >
                  <Typography variant="body2">Discount:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    -{formatCurrency(booking.pricing.discountAmount)}
                  </Typography>
                </Box>
              )}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">
                  Tax ({booking.pricing.taxPercentage}%):
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(booking.pricing.tax)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 2,
                  pt: 2,
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6">Total:</Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "primary.main" }}
                >
                  {formatCurrency(booking.pricing.totalAmount)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Payment Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Total Amount:</Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "primary.main" }}
                >
                  {formatCurrency(booking.pricing.totalAmount || 0)}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="success.main">
                  Paid Amount:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "success.main" }}
                >
                  {formatCurrency(booking.pricing.initialPayment || 0)}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="error">
                  Pending Amount:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "error" }}
                >
                  {formatCurrency(
                    (booking.pricing.totalAmount || 0) -
                      (booking.pricing.initialPayment || 0),
                  )}
                </Typography>
              </Box>
            </Box>
            {(booking.pricing.totalAmount || 0) -
              (booking.pricing.initialPayment || 0) >
              0 && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleOpenPaymentDialog}
                startIcon={<PaidIcon />}
              >
                Record Payment
              </Button>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Update Status
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={booking.status}
                label="Status"
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                gutterBottom
              >
                Created: {formatDateTime(booking.createdAt)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Updated: {formatDateTime(booking.updatedAt)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <AlertDialog
        open={alertState.open}
        onClose={hideAlert}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onConfirm={alertState.onConfirm}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        details={alertState.details}
      />

      {/* Payment Recording Dialog */}
      <Dialog
        open={openPaymentDialog}
        onClose={handleClosePaymentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          {booking && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Booking: <strong>{booking.bookingNumber}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Customer: <strong>{booking.customer.name}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Total Amount:{" "}
                <strong>{formatCurrency(booking.pricing.totalAmount)}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Already Paid:{" "}
                <strong>
                  {formatCurrency(booking.pricing.initialPayment || 0)}
                </strong>
              </Typography>
              <Typography
                variant="body2"
                color="error"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Pending:{" "}
                <strong>
                  {formatCurrency(
                    (booking.pricing.totalAmount || 0) -
                      (booking.pricing.initialPayment || 0),
                  )}
                </strong>
              </Typography>
              <TextField
                fullWidth
                label="Payment Amount (₹)"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                inputProps={{
                  min: 0,
                  max:
                    (booking.pricing.totalAmount || 0) -
                    (booking.pricing.initialPayment || 0),
                  step: 0.01,
                }}
                helperText={`Maximum: ${formatCurrency((booking.pricing.totalAmount || 0) - (booking.pricing.initialPayment || 0))}`}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog}>Cancel</Button>
          <Button
            onClick={handleRecordPayment}
            variant="contained"
            color="primary"
            disabled={recordPaymentMutation.isPending}
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BookingDetails;
