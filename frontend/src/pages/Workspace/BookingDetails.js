import React, { useState, useEffect } from "react";
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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  CheckCircle as PaidIcon,
} from "@mui/icons-material";
import {
  useBooking,
  useUpdateBooking,
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
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  const { data, isLoading, error, refetch } = useBooking(id);
  const updateBookingMutation = useUpdateBooking();
  const updateStatusMutation = useUpdateBookingStatus();
  const recordPaymentMutation = useRecordBookingPayment();
  const { alertState, showSuccess, showError, hideAlert } = useAlert();

  const booking = data?.data;

  // Update finalPrice when booking data loads or changes
  useEffect(() => {
    if (booking) {
      if (
        booking.pricing?.finalPrice !== null &&
        booking.pricing?.finalPrice !== undefined
      ) {
        setFinalPrice(booking.pricing.finalPrice);
      } else {
        setFinalPrice("");
      }
    }
  }, [booking]);

  const handleSaveFinalPrice = async () => {
    if (!finalPrice || parseFloat(finalPrice) < 0) {
      showError("Please enter a valid final price", "Validation Error");
      return;
    }

    try {
      await updateBookingMutation.mutateAsync({
        id,
        data: {
          pricing: {
            finalPrice: parseFloat(finalPrice),
          },
        },
      });

      showSuccess("Final price updated successfully!");
    } catch (error) {
      showError(error.message || "Failed to update final price");
    }
  };

  const handleStatusChange = async (newStatus) => {
    // Validate finalPrice is set before confirming
    if (
      newStatus === "confirmed" &&
      (booking?.pricing?.finalPrice === null ||
        booking?.pricing?.finalPrice === undefined)
    ) {
      showError(
        "Please set a final agreed price before confirming the booking.",
        "Final Price Required",
      );
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id,
        status: newStatus,
        notifyCustomer,
      });
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
    setPaymentMethod("cash");
    setTransactionId("");
    setPaymentNotes("");
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setPaymentAmount("");
    setPaymentMethod("cash");
    setTransactionId("");
    setPaymentNotes("");
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showError("Please enter a valid payment amount", "Validation Error");
      return;
    }

    const amount = parseFloat(paymentAmount);
    const pendingPayment =
      (booking.pricing.finalPrice || booking.pricing.totalAmount) -
      (booking.pricing.initialPayment || 0);

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
        paymentMethod,
        transactionId,
        notes: paymentNotes,
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
        {booking.status === "draft" && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/workspace/bookings/${id}/edit`)}
            color="primary"
          >
            Edit Booking
          </Button>
        )}
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
                <Typography variant="body2">Package Total:</Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  {formatCurrency(booking.pricing.totalAmount || 0)}
                </Typography>
              </Box>

              {booking.pricing.finalPrice !== null &&
                booking.pricing.finalPrice !== undefined && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Final Agreed Price:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: "primary.main",
                        fontSize: "1.1rem",
                      }}
                    >
                      {formatCurrency(booking.pricing.finalPrice)}
                    </Typography>
                  </Box>
                )}

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
                    (booking.pricing.finalPrice ||
                      booking.pricing.totalAmount ||
                      0) - (booking.pricing.initialPayment || 0),
                  )}
                </Typography>
              </Box>
            </Box>
            {(booking.pricing.finalPrice || booking.pricing.totalAmount || 0) -
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

          {booking.paymentHistory && booking.paymentHistory.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Payment History
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Date</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Amount</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Method</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Transaction ID</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Notes</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {booking.paymentHistory
                      .slice()
                      .reverse()
                      .map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {formatDateTime(payment.paymentDate)}
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 600, color: "success.main" }}
                          >
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={payment.paymentMethod
                                .replace("_", " ")
                                .toUpperCase()}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{payment.transactionId || "-"}</TableCell>
                          <TableCell>{payment.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Final Price Section - Only in Draft Status */}
          {booking.status === "draft" && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Set Final Agreed Price
              </Typography>

              {/* Price Suggestions */}
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 1.5 }}
                >
                  💡 Suggested Prices (Click to Use)
                </Typography>

                {(() => {
                  const total = booking.pricing.totalAmount;

                  // Negotiating Price: -5%
                  const negotiatingPrice =
                    Math.round((total * 0.95) / 100) * 100;

                  // Best Price: Smart logic based on amount
                  let bestDiscountPercent;
                  if (total > 500000) {
                    bestDiscountPercent = 0.015; // 1.5% for premium bookings
                  } else if (total > 300000) {
                    bestDiscountPercent = 0.02; // 2% for mid-high bookings
                  } else if (total > 150000) {
                    bestDiscountPercent = 0.025; // 2.5% for medium bookings
                  } else {
                    bestDiscountPercent = 0.03; // 3% for smaller bookings
                  }

                  // Round to nearest 500 for cleaner negotiation
                  const bestPrice =
                    Math.round((total * (1 - bestDiscountPercent)) / 500) * 500;

                  // Customer Quote: +5%
                  const customerQuote = Math.round((total * 1.05) / 100) * 100;

                  return (
                    <>
                      {/* Customer Quote Price */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                          p: 1,
                          bgcolor: "warning.lighter",
                          borderRadius: 0.5,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "warning.light" },
                        }}
                        onClick={() => setFinalPrice(customerQuote)}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          Initial Quote (+5%):
                        </Typography>
                        <Chip
                          label={formatCurrency(customerQuote)}
                          size="small"
                          sx={{
                            bgcolor: "warning.main",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>

                      {/* Recommended Best Price */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                          p: 1,
                          bgcolor: "success.lighter",
                          borderRadius: 0.5,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "success.light" },
                        }}
                        onClick={() => setFinalPrice(bestPrice)}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          ⭐ Best Deal (
                          {((1 - bestPrice / total) * 100).toFixed(1)}% off):
                        </Typography>
                        <Chip
                          label={formatCurrency(bestPrice)}
                          size="small"
                          sx={{
                            bgcolor: "success.main",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>

                      {/* Negotiating Price */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 1,
                          bgcolor: "info.lighter",
                          borderRadius: 0.5,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "info.light" },
                        }}
                        onClick={() => setFinalPrice(negotiatingPrice)}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          Hard Negotiation (-5%):
                        </Typography>
                        <Chip
                          label={formatCurrency(negotiatingPrice)}
                          size="small"
                          sx={{
                            bgcolor: "info.main",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>
                    </>
                  );
                })()}

                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 1,
                    color: "text.secondary",
                    fontStyle: "italic",
                  }}
                >
                  Click any suggestion to auto-fill final price
                </Typography>
              </Box>

              {/* Final Price Input */}
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <TextField
                  label="Final Agreed Price (₹)"
                  type="number"
                  fullWidth
                  required
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  inputProps={{ min: 0, step: 100 }}
                  helperText="Enter or select the final negotiated price"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.paper",
                      fontWeight: 600,
                      fontSize: "1.1rem",
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSaveFinalPrice}
                  disabled={!finalPrice || updateBookingMutation.isPending}
                  sx={{ minWidth: 120, height: 56 }}
                >
                  {updateBookingMutation.isPending ? "Saving..." : "Save Price"}
                </Button>
              </Box>

              {booking.pricing.finalPrice !== null &&
                booking.pricing.finalPrice !== undefined && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: "success.lighter",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "success.main",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "success.dark" }}
                    >
                      ✓ Current Final Price:{" "}
                      {formatCurrency(booking.pricing.finalPrice)}
                    </Typography>
                  </Box>
                )}
            </Paper>
          )}

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Update Status
            </Typography>

            {/* Status Information */}
            {booking.status === "draft" && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor:
                    booking.pricing.finalPrice !== null &&
                    booking.pricing.finalPrice !== undefined
                      ? "success.lighter"
                      : "warning.lighter",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor:
                    booking.pricing.finalPrice !== null &&
                    booking.pricing.finalPrice !== undefined
                      ? "success.main"
                      : "warning.main",
                }}
              >
                {booking.pricing.finalPrice !== null &&
                booking.pricing.finalPrice !== undefined ? (
                  <>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "success.dark", mb: 0.5 }}
                    >
                      ✓ Final Price Set:{" "}
                      {formatCurrency(booking.pricing.finalPrice)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      This booking is ready to be confirmed.
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "warning.dark", mb: 0.5 }}
                    >
                      ⚠ Final Price Not Set
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Please set a final agreed price above before confirming.
                    </Typography>
                  </>
                )}
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={booking.status}
                label="Status"
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={
                  booking.status === "completed" ||
                  booking.status === "cancelled"
                }
              >
                {booking.status === "draft" && [
                  <MenuItem key="draft" value="draft">
                    Draft
                  </MenuItem>,
                  <MenuItem key="confirmed" value="confirmed">
                    Confirmed
                  </MenuItem>,
                  <MenuItem key="cancelled" value="cancelled">
                    Cancelled
                  </MenuItem>,
                ]}
                {booking.status === "confirmed" && [
                  <MenuItem key="confirmed" value="confirmed">
                    Confirmed
                  </MenuItem>,
                  <MenuItem key="completed" value="completed">
                    Completed
                  </MenuItem>,
                  <MenuItem key="cancelled" value="cancelled">
                    Cancelled
                  </MenuItem>,
                ]}
                {booking.status === "completed" && (
                  <MenuItem value="completed">Completed</MenuItem>
                )}
                {booking.status === "cancelled" && (
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Notify customer toggle — shown when status can still change */}
            {booking.status !== "completed" &&
              booking.status !== "cancelled" && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifyCustomer}
                      onChange={(e) => setNotifyCustomer(e.target.checked)}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      Notify customer via email on status change
                      {!booking.customer?.email && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="error"
                          sx={{ ml: 0.5 }}
                        >
                          (no email on file)
                        </Typography>
                      )}
                    </Typography>
                  }
                  sx={{ mt: 1, display: "flex", alignItems: "center" }}
                />
              )}
            {booking.status === "confirmed" && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                ℹ Confirmed bookings can be marked as Completed or Cancelled.
              </Typography>
            )}
            {(booking.status === "completed" ||
              booking.status === "cancelled") && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                ℹ This booking is {booking.status} and can no longer be changed.
              </Typography>
            )}

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
                {booking.pricing.finalPrice
                  ? "Final Agreed Price"
                  : "Total Amount"}
                :{" "}
                <strong>
                  {formatCurrency(
                    booking.pricing.finalPrice || booking.pricing.totalAmount,
                  )}
                </strong>
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
                    (booking.pricing.finalPrice ||
                      booking.pricing.totalAmount ||
                      0) - (booking.pricing.initialPayment || 0),
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
                    (booking.pricing.finalPrice ||
                      booking.pricing.totalAmount ||
                      0) - (booking.pricing.initialPayment || 0),
                  step: 0.01,
                }}
                helperText={`Maximum: ${formatCurrency((booking.pricing.finalPrice || booking.pricing.totalAmount || 0) - (booking.pricing.initialPayment || 0))}`}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Transaction ID (Optional)"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={2}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
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
