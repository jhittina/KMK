import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  usePackages,
  useCalculateBooking,
  useUpdateBooking,
  useBooking,
} from "../../hooks/useWorkspace";
import Loading from "../../components/Common/Loading";
import AlertDialog from "../../components/Common/AlertDialog";
import DatePickerField from "../../components/Common/DatePickerField";
import { useAlert } from "../../hooks/useAlert";
import { formatCurrency } from "../../utils/helpers";

function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { alertState, showSuccess, showError, hideAlert } = useAlert();

  const [formData, setFormData] = useState({
    customer: { name: "", email: "", phone: "" },
    eventDetails: {
      eventDate: "",
      eventType: "Wedding",
      venue: "",
      guestCount: 100,
    },
    packageIds: [],
    discountType: "none",
    discountValue: 0,
    taxPercentage: 18,
    finalPrice: "",
    initialPayment: 0,
    status: "draft",
  });

  const { data: bookingData, isLoading: bookingLoading } = useBooking(id);
  const { data: packagesData, isLoading: packagesLoading } = usePackages({
    isActive: true,
  });

  // Use React Query for automatic caching of calculations
  const calculationParams =
    formData.packageIds?.length > 0 && formData.eventDetails.guestCount
      ? {
          packageIds: formData.packageIds,
          guestCount: formData.eventDetails.guestCount,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          taxPercentage: formData.taxPercentage,
        }
      : null;

  const { data: calculationData } = useCalculateBooking(calculationParams);
  const calculation = calculationData?.data;

  const updateMutation = useUpdateBooking();

  // Load booking data
  useEffect(() => {
    if (bookingData?.data) {
      const booking = bookingData.data;
      setFormData({
        customer: {
          name: booking.customer.name,
          email: booking.customer.email || "",
          phone: booking.customer.phone,
        },
        eventDetails: {
          eventDate: new Date(booking.eventDetails.eventDate)
            .toISOString()
            .split("T")[0],
          eventType: booking.eventDetails.eventType,
          venue: booking.eventDetails.venue,
          guestCount: booking.eventDetails.guestCount,
        },
        packageIds: booking.packages
          .map((pkg) => {
            // Handle both string IDs and populated package objects
            if (typeof pkg === "string") return pkg;
            return pkg.packageId?._id || pkg.packageId || pkg._id;
          })
          .filter(Boolean),
        discountType: booking.pricing.discountType || "none",
        discountValue: booking.pricing.discountValue || 0,
        taxPercentage: booking.pricing.taxPercentage || 18,
        finalPrice: booking.pricing.finalPrice || "",
        initialPayment: booking.pricing.initialPayment || 0,
        status: booking.status || "draft",
      });
    }
  }, [bookingData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customer: {
          name: formData.customer.name.trim(),
          email: formData.customer.email?.trim() || undefined,
          phone: formData.customer.phone.trim(),
        },
        eventDetails: {
          eventDate: formData.eventDetails.eventDate,
          eventType: formData.eventDetails.eventType,
          venue: formData.eventDetails.venue.trim(),
          guestCount: parseInt(formData.eventDetails.guestCount),
        },
        packageIds: formData.packageIds,
        pricing: {
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue) || 0,
          taxPercentage: parseFloat(formData.taxPercentage) || 18,
          finalPrice: formData.finalPrice
            ? parseFloat(formData.finalPrice)
            : null,
          initialPayment: parseFloat(formData.initialPayment) || 0,
        },
      };

      await updateMutation.mutateAsync({ id, data: payload });
      showSuccess("Booking updated successfully!", "Success");
      setTimeout(() => navigate(`/workspace/bookings/${id}`), 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update booking";
      showError(errorMessage);
    }
  };

  if (bookingLoading || packagesLoading) return <Loading />;

  return (
    <Box>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        sx={{
          fontWeight: 700,
          mb: 3,
          fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" },
        }}
      >
        Edit Booking
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Customer Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    required
                    value={formData.customer.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer: {
                          ...formData.customer,
                          name: e.target.value,
                        },
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    required
                    value={formData.customer.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer: {
                          ...formData.customer,
                          phone: e.target.value,
                        },
                      })
                    }
                    inputProps={{ pattern: "[0-9]{10}", maxLength: 10 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={formData.customer.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer: {
                          ...formData.customer,
                          email: e.target.value,
                        },
                      })
                    }
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Event Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePickerField
                    label="Event Date"
                    required
                    value={formData.eventDetails.eventDate}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        eventDetails: {
                          ...formData.eventDetails,
                          eventDate: val,
                        },
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                      value={formData.eventDetails.eventType}
                      label="Event Type"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          eventDetails: {
                            ...formData.eventDetails,
                            eventType: e.target.value,
                          },
                        })
                      }
                    >
                      <MenuItem value="Wedding">Wedding</MenuItem>
                      <MenuItem value="Reception">Reception</MenuItem>
                      <MenuItem value="Engagement">Engagement</MenuItem>
                      <MenuItem value="Pre-Wedding">Pre-Wedding</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Venue</InputLabel>
                    <Select
                      label="Venue"
                      value={
                        [
                          "Main Hall",
                          "Haldi Hall",
                          "Banquet Hall",
                          "Banquet Hall without AC",
                        ].includes(formData.eventDetails.venue)
                          ? formData.eventDetails.venue
                          : formData.eventDetails.venue
                            ? "Other"
                            : ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          eventDetails: {
                            ...formData.eventDetails,
                            venue: val === "Other" ? "" : val,
                          },
                        });
                      }}
                    >
                      <MenuItem value="Main Hall">Main Hall</MenuItem>
                      <MenuItem value="Haldi Hall">Haldi Hall</MenuItem>
                      <MenuItem value="Banquet Hall">Banquet Hall</MenuItem>
                      <MenuItem value="Banquet Hall without AC">
                        Banquet Hall without AC
                      </MenuItem>
                      <MenuItem value="Other">Other (custom)</MenuItem>
                    </Select>
                  </FormControl>
                  {/* Show custom input when Other is selected or existing value is custom */}
                  {![
                    "",
                    "Main Hall",
                    "Haldi Hall",
                    "Banquet Hall",
                    "Banquet Hall without AC",
                  ].includes(formData.eventDetails.venue) ? (
                    <TextField
                      label="Custom Venue"
                      fullWidth
                      required
                      sx={{ mt: 1 }}
                      value={formData.eventDetails.venue}
                      placeholder="Enter venue name"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          eventDetails: {
                            ...formData.eventDetails,
                            venue: e.target.value,
                          },
                        })
                      }
                    />
                  ) : null}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Guest Count"
                    type="number"
                    fullWidth
                    required
                    value={formData.eventDetails.guestCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        eventDetails: {
                          ...formData.eventDetails,
                          guestCount: parseInt(e.target.value),
                        },
                      })
                    }
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Select Packages
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Packages</InputLabel>
                <Select
                  multiple
                  value={formData.packageIds}
                  label="Packages"
                  onChange={(e) =>
                    setFormData({ ...formData, packageIds: e.target.value })
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => {
                        // Handle both string IDs and package objects
                        const pkgId =
                          typeof value === "string" ? value : value?._id;
                        const pkg = packagesData?.data?.find(
                          (p) => p._id === pkgId,
                        );
                        return (
                          <Chip
                            key={pkgId}
                            label={pkg?.name || pkgId || "Unknown"}
                            size="small"
                            color="primary"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {packagesData?.data?.map((pkg) => (
                    <MenuItem key={pkg._id} value={pkg._id}>
                      {pkg.name} - {pkg.category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Tax Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="GST/Tax Percentage"
                    type="number"
                    fullWidth
                    value={formData.taxPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxPercentage: parseFloat(e.target.value),
                      })
                    }
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText="Enter GST percentage (e.g., 18 for 18%)"
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Discount (Optional)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      value={formData.discountType}
                      label="Discount Type"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountType: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="none">No Discount</MenuItem>
                      <MenuItem value="percentage">Percentage</MenuItem>
                      <MenuItem value="flat">Flat Amount</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {formData.discountType !== "none" && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={
                        formData.discountType === "percentage"
                          ? "Percentage"
                          : "Amount"
                      }
                      type="number"
                      fullWidth
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: parseFloat(e.target.value),
                        })
                      }
                    />
                  </Grid>
                )}
              </Grid>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Payment Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Initial Payment (₹)"
                    type="number"
                    fullWidth
                    value={formData.initialPayment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initialPayment: parseFloat(e.target.value) || 0,
                      })
                    }
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Amount paid upfront by customer"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: "sticky", top: 80 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Price Summary
              </Typography>

              {calculation ? (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(calculation.subtotal)}
                    </Typography>
                  </Box>
                  {calculation.discountAmount > 0 && (
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
                        -{formatCurrency(calculation.discountAmount)}
                      </Typography>
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">
                      Tax ({calculation.taxPercentage || formData.taxPercentage}
                      %):
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(calculation.tax)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6">Package Total:</Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      {formatCurrency(calculation.totalAmount)}
                    </Typography>
                  </Box>

                  {/* Price Suggestions - Only show if status is draft */}
                  {formData.status === "draft" && (
                    <Box
                      sx={{
                        mt: 3,
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
                        const total = calculation.totalAmount;

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
                          Math.round(
                            (total * (1 - bestDiscountPercent)) / 500,
                          ) * 500;

                        // Customer Quote: +5%
                        const customerQuote =
                          Math.round((total * 1.05) / 100) * 100;

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
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  finalPrice: customerQuote,
                                })
                              }
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 500 }}
                              >
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
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  finalPrice: bestPrice,
                                })
                              }
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 500 }}
                              >
                                ⭐ Best Deal (
                                {((1 - bestPrice / total) * 100).toFixed(1)}%
                                off):
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
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  finalPrice: negotiatingPrice,
                                })
                              }
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 500 }}
                              >
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
                  )}

                  {/* Final Price Input */}
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      label="Final Agreed Price (₹)"
                      type="number"
                      fullWidth
                      required
                      value={formData.finalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          finalPrice: parseFloat(e.target.value) || "",
                        })
                      }
                      inputProps={{ min: 0, step: 100 }}
                      helperText={
                        formData.status === "draft"
                          ? "Enter the final negotiated price (required before confirming)"
                          : "Final price is locked after confirmation"
                      }
                      disabled={formData.status !== "draft"}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "background.paper",
                          fontWeight: 600,
                          fontSize: "1.1rem",
                        },
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="success.main">
                      Initial Payment:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "success.main" }}
                    >
                      {formatCurrency(parseFloat(formData.initialPayment) || 0)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Typography variant="body2" color="error">
                      Pending Payment:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "error" }}
                    >
                      {formatCurrency(
                        (parseFloat(formData.finalPrice) ||
                          calculation.totalAmount) -
                          (parseFloat(formData.initialPayment) || 0),
                      )}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ my: 3 }}
                >
                  Select a package to see price details
                </Typography>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={
                    !formData.packageIds ||
                    formData.packageIds.length === 0 ||
                    !formData.customer.name ||
                    !formData.customer.phone ||
                    !formData.eventDetails.eventDate ||
                    !formData.finalPrice ||
                    updateMutation.isPending
                  }
                >
                  {updateMutation.isPending ? "Updating..." : "Update Booking"}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(`/workspace/bookings/${id}`)}
                >
                  Cancel
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </form>

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
    </Box>
  );
}

export default EditBooking;
