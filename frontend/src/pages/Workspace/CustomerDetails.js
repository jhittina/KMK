import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useCustomer, useCustomerStats } from "../../hooks/useWorkspace";
import Loading from "../../components/Common/Loading";
import ErrorMessage from "../../components/Common/ErrorMessage";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
} from "../../utils/helpers";

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useCustomer(id);
  const { data: statsData } = useCustomerStats(id);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  const customer = data?.data;
  const stats = statsData?.data;
  if (!customer) return null;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/workspace/customers")}
        sx={{ mb: 2 }}
      >
        Back to Customers
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <PersonIcon sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {customer.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {customer.phone} {customer.email && `• ${customer.email}`}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Primary Phone
                </Typography>
                <Typography variant="body1">{customer.phone}</Typography>
              </Grid>
              {customer.alternatePhone && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Alternate Phone
                  </Typography>
                  <Typography variant="body1">
                    {customer.alternatePhone}
                  </Typography>
                </Grid>
              )}
              {customer.email && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{customer.email}</Typography>
                </Grid>
              )}
              {customer.address && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {[
                      customer.address.street,
                      customer.address.city,
                      customer.address.state,
                      customer.address.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Not provided"}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {customer.bookings && customer.bookings.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Booking History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Booking #</TableCell>
                      <TableCell>Event Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customer.bookings.map((booking) => (
                      <TableRow
                        key={booking._id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() =>
                          navigate(`/workspace/bookings/${booking._id}`)
                        }
                      >
                        <TableCell
                          sx={{ color: "primary.main", fontWeight: 600 }}
                        >
                          {booking.bookingNumber}
                        </TableCell>
                        <TableCell>
                          {formatDate(booking.eventDetails?.eventDate)}
                        </TableCell>
                        <TableCell>{booking.eventDetails?.eventType}</TableCell>
                        <TableCell>
                          {formatCurrency(booking.pricing?.totalAmount || 0)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status?.toUpperCase()}
                            size="small"
                            color={getStatusColor(booking.status)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {stats && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Customer Statistics
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="h4"
                      color="primary.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {stats.totalBookings}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Bookings
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="h4"
                      color="success.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {formatCurrency(stats.totalSpent)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Spent
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="h4"
                      color="secondary.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {formatCurrency(stats.averageBookingValue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Average Booking Value
                    </Typography>
                  </CardContent>
                </Card>

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {stats.confirmedBookings}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Confirmed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {stats.completedBookings}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Completed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  gutterBottom
                >
                  Created: {formatDateTime(customer.createdAt)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Updated: {formatDateTime(customer.updatedAt)}
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default CustomerDetails;
