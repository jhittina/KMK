import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  usePackages,
  useCalculateBooking,
  useCreateBooking,
  useCustomers,
} from "../../hooks/useWorkspace";
import Loading from "../../components/Common/Loading";
import AlertDialog from "../../components/Common/AlertDialog";
import DatePickerField from "../../components/Common/DatePickerField";
import { useAlert } from "../../hooks/useAlert";
import { formatCurrency } from "../../utils/helpers";

function CreateBooking() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { alertState, showSuccess, showError, hideAlert } = useAlert();
  const [customerType, setCustomerType] = useState("new"); // "new" or "existing"
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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
  });

  const { data: packagesData, isLoading } = usePackages({ isActive: true });
  const { data: customersData, isLoading: customersLoading } = useCustomers();

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

  const { data: calculationData, isLoading: isCalculating } =
    useCalculateBooking(calculationParams);
  const calculation = calculationData?.data;

  const createMutation = useCreateBooking();

  const handleCustomerTypeChange = (event, newType) => {
    if (newType !== null) {
      setCustomerType(newType);
      if (newType === "new") {
        setSelectedCustomer(null);
        setFormData({
          ...formData,
          customer: { name: "", email: "", phone: "" },
        });
      }
    }
  };

  const handleCustomerSelect = (event, value) => {
    setSelectedCustomer(value);
    if (value) {
      setFormData({
        ...formData,
        customer: {
          name: value.name,
          email: value.email || "",
          phone: value.phone,
        },
      });
    } else {
      setFormData({
        ...formData,
        customer: { name: "", email: "", phone: "" },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare clean payload for backend
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
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue) || 0,
        taxPercentage: parseFloat(formData.taxPercentage) || 18,
        finalPrice: parseFloat(formData.finalPrice) || undefined,
        initialPayment: parseFloat(formData.initialPayment) || 0,
      };

      const result = await createMutation.mutateAsync(payload);
      showSuccess(
        `Booking created successfully!\nBooking Number: ${result.data.bookingNumber}`,
        "Booking Created",
      );
      setTimeout(() => navigate("/workspace/bookings"), 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to create booking";
      showError(errorMessage);
    }
  };

  if (isLoading) return <Loading />;

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
        Create Booking
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Customer Information
              </Typography>

              <ToggleButtonGroup
                value={customerType}
                exclusive
                onChange={handleCustomerTypeChange}
                sx={{ mb: 3 }}
                fullWidth
              >
                <ToggleButton value="new">New Customer</ToggleButton>
                <ToggleButton value="existing">
                  Select Existing Customer
                </ToggleButton>
              </ToggleButtonGroup>

              {customerType === "existing" && (
                <Autocomplete
                  options={customersData?.data || []}
                  getOptionLabel={(option) =>
                    `${option.name} - ${option.phone}`
                  }
                  value={selectedCustomer}
                  onChange={handleCustomerSelect}
                  loading={customersLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Customer"
                      placeholder="Type customer name or phone..."
                      required={customerType === "existing"}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.phone} {option.email && `• ${option.email}`}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  sx={{ mb: 2 }}
                />
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Customer Name"
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
                    disabled={customerType === "existing" && selectedCustomer}
                    InputProps={{
                      readOnly: customerType === "existing" && selectedCustomer,
                    }}
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
                    disabled={customerType === "existing" && selectedCustomer}
                    InputProps={{
                      readOnly: customerType === "existing" && selectedCustomer,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
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
                    disabled={customerType === "existing" && selectedCustomer}
                    InputProps={{
                      readOnly: customerType === "existing" && selectedCustomer,
                    }}
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
                  <TextField
                    label="Venue"
                    fullWidth
                    required
                    value={formData.eventDetails.venue}
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
                Package Selection
              </Typography>
              <Autocomplete
                multiple
                options={packagesData?.data || []}
                getOptionLabel={(option) =>
                  `${option.name} - ${option.category}`
                }
                value={
                  packagesData?.data?.filter((pkg) =>
                    formData.packageIds.includes(pkg._id),
                  ) || []
                }
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    packageIds: newValue.map((pkg) => pkg._id),
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Packages"
                    placeholder="Select one or more packages..."
                    required={formData.packageIds.length === 0}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option._id}
                      label={`${option.name} (${option.category})`}
                      {...getTagProps({ index })}
                      color="primary"
                      size="small"
                    />
                  ))
                }
              />
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

              {isCalculating ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 4,
                  }}
                >
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Calculating price...
                  </Typography>
                </Box>
              ) : calculation ? (
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

                  {/* Price Suggestions */}
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

                      // Best Price: Smart logic based on amount and guest count
                      // Larger events get smaller discounts, but still attractive
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
                        Math.round((total * (1 - bestDiscountPercent)) / 500) *
                        500;

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
                      helperText="Required: Enter the final negotiated price to create booking"
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
                    !formData.eventDetails.venue ||
                    !formData.eventDetails.guestCount ||
                    !formData.finalPrice ||
                    isCalculating ||
                    !calculation ||
                    createMutation.isPending
                  }
                >
                  {createMutation.isPending ? "Creating..." : "Create Booking"}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/workspace/bookings")}
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

export default CreateBooking;
