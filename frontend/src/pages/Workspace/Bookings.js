import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  useTheme,
  useMediaQuery,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useBookings, useDeleteBooking } from "../../hooks/useWorkspace";
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

function Bookings() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { alertState, showConfirm, showError, showSuccess, hideAlert } =
    useAlert();

  const { data, isLoading, error, refetch } = useBookings({
    status: statusFilter || undefined,
  });
  const deleteMutation = useDeleteBooking();

  // Reset page when filter changes
  React.useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const handleDeleteClick = (booking) => {
    const details = (
      <>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Booking Number:</strong> {booking.bookingNumber}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Customer:</strong> {booking.customer.name}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Event Date:</strong>{" "}
          {new Date(booking.eventDetails.eventDate).toLocaleDateString()}
        </Typography>
        <Typography variant="body2">
          <strong>Total Amount:</strong> ₹
          {booking.pricing.totalAmount.toLocaleString("en-IN")}
        </Typography>
      </>
    );

    showConfirm(
      "Are you sure you want to delete this booking? This action cannot be undone.",
      async () => {
        try {
          await deleteMutation.mutateAsync(booking._id);
          showSuccess("Booking deleted successfully");
        } catch (error) {
          showError(error.message || "Failed to delete booking");
        }
      },
      "Delete Booking",
      "Delete",
      "Cancel",
      details,
    );
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          mb: 3,
          gap: 2,
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700 }}>
          Bookings
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/workspace/bookings/new")}
          fullWidth={isMobile}
        >
          Create Booking
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: { xs: 800, md: "auto" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <strong>Booking #</strong>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <strong>Customer</strong>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <strong>Event Date</strong>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <strong>Event Type</strong>
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  display: { xs: "none", md: "table-cell" },
                }}
              >
                <strong>Guests</strong>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <strong>Total</strong>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <strong>Paid</strong>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <strong>Pending</strong>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <strong>Status</strong>
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  display: { xs: "none", lg: "table-cell" },
                }}
              >
                <strong>Created</strong>
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  display: { xs: "none", lg: "table-cell" },
                }}
              >
                <strong>Updated</strong>
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((booking) => (
                <TableRow key={booking._id} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      {booking.bookingNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {booking.customer.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {booking.customer.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {formatDate(booking.eventDetails.eventDate)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.eventDetails.eventType}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    {booking.eventDetails.guestCount}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    {formatCurrency(booking.pricing.totalAmount)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "success.main" }}
                    >
                      {formatCurrency(booking.pricing.initialPayment || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color:
                          booking.pricing.totalAmount -
                            (booking.pricing.initialPayment || 0) >
                          0
                            ? "error"
                            : "success.main",
                      }}
                    >
                      {formatCurrency(
                        (booking.pricing.totalAmount || 0) -
                          (booking.pricing.initialPayment || 0),
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status.toUpperCase()}
                      size="small"
                      color={getStatusColor(booking.status)}
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(booking.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(booking.updatedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() =>
                        navigate(`/workspace/bookings/${booking._id}`)
                      }
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(booking)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={data?.data?.length || 0}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {data?.data?.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No bookings found
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/workspace/bookings/new")}
            sx={{ mt: 2 }}
          >
            Create Your First Booking
          </Button>
        </Box>
      )}

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

export default Bookings;
