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
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  useTheme,
  useMediaQuery,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "../../hooks/useWorkspace";
import Loading from "../../components/Common/Loading";
import ErrorMessage from "../../components/Common/ErrorMessage";
import AlertDialog from "../../components/Common/AlertDialog";
import { useAlert } from "../../hooks/useAlert";
import { formatDateTime } from "../../utils/helpers";

function Customers() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: { street: "", city: "", state: "", pincode: "" },
  });

  const { data, isLoading, error, refetch } = useCustomers({
    search: searchQuery || undefined,
  });
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();
  const { alertState, showConfirm, showError, showSuccess, hideAlert } =
    useAlert();

  // Reset page when search changes
  React.useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  // Sort customers by latest updated first
  const sortedCustomers = React.useMemo(() => {
    if (!data?.data) return [];
    return [...data.data].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  }, [data?.data]);

  const handleOpen = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone,
        alternatePhone: customer.alternatePhone || "",
        address: customer.address || {
          street: "",
          city: "",
          state: "",
          pincode: "",
        },
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        alternatePhone: "",
        address: { street: "", city: "", state: "", pincode: "" },
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingCustomer) {
        await updateMutation.mutateAsync({
          id: editingCustomer._id,
          data: formData,
        });
        showSuccess("Customer updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        showSuccess("Customer created successfully");
      }
      handleClose();
    } catch (error) {
      showError(error.message || "Failed to save customer");
    }
  };

  const handleDelete = async (customer) => {
    showConfirm(
      `Are you sure you want to delete customer "${customer.name}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteMutation.mutateAsync(customer._id);
          showSuccess("Customer deleted successfully");
        } catch (error) {
          showError(error.message || "Failed to delete customer");
        }
      },
      "Delete Customer",
      "Delete",
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
          Customers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          fullWidth={isMobile}
        >
          Add Customer
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: { xs: 650, md: "auto" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <strong>Name</strong>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <strong>Phone</strong>
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  display: { xs: "none", sm: "table-cell" },
                }}
              >
                <strong>Email</strong>
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  display: { xs: "none", md: "table-cell" },
                }}
              >
                <strong>City</strong>
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  display: { xs: "none", lg: "table-cell" },
                }}
              >
                <strong>Total Bookings</strong>
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  display: { xs: "none", lg: "table-cell" },
                }}
              >
                <strong>Total Spent</strong>
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
            {sortedCustomers
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((customer) => (
                <TableRow key={customer._id} hover>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    {customer.email || "-"}
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    {customer.address?.city || "-"}
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    {customer.totalBookings}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      display: { xs: "none", lg: "table-cell" },
                    }}
                  >
                    ₹{customer.totalSpent?.toLocaleString("en-IN") || 0}
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(customer.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(customer.updatedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() =>
                        navigate(`/workspace/customers/${customer._id}`)
                      }
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(customer)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(customer)}
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
        count={sortedCustomers?.length || 0}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCustomer ? "Edit Customer" : "Add Customer"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                inputProps={{ pattern: "[0-9]{10}", maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Alternate Phone"
                fullWidth
                value={formData.alternatePhone}
                onChange={(e) =>
                  setFormData({ ...formData, alternatePhone: e.target.value })
                }
                inputProps={{ pattern: "[0-9]{10}", maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Street Address"
                fullWidth
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                fullWidth
                value={formData.address.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                fullWidth
                value={formData.address.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Pincode"
                fullWidth
                value={formData.address.pincode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, pincode: e.target.value },
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.name ||
              !formData.phone ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editingCustomer ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

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

export default Customers;
