import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as PaidIcon,
  Pending as PendingIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
} from "@mui/icons-material";
import {
  useExpenses,
  useExpenseSummary,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useRecordExpensePayment,
  useToggleExpenseActive,
} from "../../hooks/useConfig";
import { useAlert } from "../../hooks/useAlert";
import AlertDialog from "../../components/Common/AlertDialog";
import Loading from "../../components/Common/Loading";
import DatePickerField from "../../components/Common/DatePickerField";

const Expenses = () => {
  const [selectedTab, setSelectedTab] = useState(0); // 0: Monthly, 1: One-time
  const [openDialog, setOpenDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedExpenseForPayment, setSelectedExpenseForPayment] =
    useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { alertState, showSuccess, showError, showConfirm, hideAlert } =
    useAlert();

  // Form state
  const [formData, setFormData] = useState({
    type: "monthly",
    category: "",
    title: "",
    amount: "",
    initialPayment: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    recurrenceDay: 1,
    employeeDetails: {
      name: "",
      position: "",
      employeeId: "",
    },
    notes: "",
  });

  const type = selectedTab === 0 ? "monthly" : "one-time";

  // Queries
  const { data: expensesData, isLoading: isLoadingExpenses } = useExpenses({
    type,
    category: categoryFilter || undefined,
    paymentStatus: statusFilter || undefined,
  });

  const { data: summaryData } = useExpenseSummary();

  // Mutations
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const recordPayment = useRecordExpensePayment();
  const toggleActive = useToggleExpenseActive();

  const expenses = expensesData?.data || [];
  const summary = summaryData?.data || {};

  const handleOpenDialog = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        type: expense.type,
        category: expense.category,
        title: expense.title,
        amount: expense.amount,
        initialPayment: expense.initialPayment || 0,
        description: expense.description || "",
        startDate: expense.startDate
          ? new Date(expense.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        endDate: expense.endDate
          ? new Date(expense.endDate).toISOString().split("T")[0]
          : "",
        recurrenceDay: expense.recurrenceDay || 1,
        employeeDetails: expense.employeeDetails || {
          name: "",
          position: "",
          employeeId: "",
        },
        notes: expense.notes || "",
      });
    } else {
      setEditingExpense(null);
      setFormData({
        type,
        category: "",
        title: "",
        amount: "",
        initialPayment: "",
        description: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        recurrenceDay: 1,
        employeeDetails: {
          name: "",
          position: "",
          employeeId: "",
        },
        notes: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpense(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("employee_")) {
      const field = name.replace("employee_", "");
      setFormData((prev) => ({
        ...prev,
        employeeDetails: {
          ...prev.employeeDetails,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.title || !formData.amount || !formData.category) {
      showError("Please fill in all required fields", "Validation Error");
      return;
    }

    if (formData.category === "salary") {
      if (
        !formData.employeeDetails.name ||
        !formData.employeeDetails.position
      ) {
        showError(
          "Employee name and position are required for salary expenses",
          "Validation Error",
        );
        return;
      }
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      recurrenceDay:
        formData.type === "monthly"
          ? parseInt(formData.recurrenceDay)
          : undefined,
      endDate: formData.endDate || undefined,
    };

    try {
      if (editingExpense) {
        await updateExpense.mutateAsync({
          id: editingExpense._id,
          data: payload,
        });
        showSuccess("Expense updated successfully");
      } else {
        await createExpense.mutateAsync(payload);
        showSuccess("Expense created successfully");
      }
      handleCloseDialog();
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to save expense",
        "Error",
      );
    }
  };

  const handleDelete = async (id) => {
    showConfirm(
      "Are you sure you want to delete this expense?",
      "Delete Expense",
      async () => {
        try {
          await deleteExpense.mutateAsync(id);
          showSuccess("Expense deleted successfully");
        } catch (error) {
          showError(
            error.response?.data?.message || "Failed to delete expense",
            "Error",
          );
        }
      },
    );
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleActive.mutateAsync(id);
      showSuccess("Expense status updated");
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to update status",
        "Error",
      );
    }
  };

  const handleOpenPaymentDialog = (expense) => {
    setSelectedExpenseForPayment(expense);
    setPaymentAmount("");
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setSelectedExpenseForPayment(null);
    setPaymentAmount("");
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showError("Please enter a valid payment amount", "Validation Error");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount > selectedExpenseForPayment.pendingPayment) {
      showError(
        `Payment amount cannot exceed pending payment of ₹${selectedExpenseForPayment.pendingPayment}`,
        "Validation Error",
      );
      return;
    }

    try {
      await recordPayment.mutateAsync({
        id: selectedExpenseForPayment._id,
        amount,
      });
      showSuccess(`Payment of ₹${amount} recorded successfully`);
      handleClosePaymentDialog();
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to record payment",
        "Error",
      );
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoadingExpenses) return <Loading />;

  const paginatedExpenses = expenses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box sx={{ p: 3 }}>
      <AlertDialog {...alertState} onClose={hideAlert} />

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          💰 Expenses Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Expense
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Monthly Expenses
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="error">
                ₹{((summary.monthlyTotal || 0) / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Per month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                One-time Investments
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                ₹{((summary.oneTimeTotal || 0) / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="caption" color="textSecondary">
                This period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="error.dark">
                ₹{((summary.totalExpenses || 0) / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Combined
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Payments
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="warning.dark">
                {summary.pendingPaymentsCount || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Need attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => {
            setSelectedTab(newValue);
            setPage(0);
            setCategoryFilter("");
            setStatusFilter("");
          }}
        >
          <Tab label="Monthly Expenses" />
          <Tab label="One-time Investments" />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(0);
                }}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="salary">Salary</MenuItem>
                <MenuItem value="expenses">Expenses</MenuItem>
                <MenuItem value="new_inventory">New Inventory</MenuItem>
                <MenuItem value="investment">Investment</MenuItem>
                <MenuItem value="utilities">Utilities</MenuItem>
                <MenuItem value="rent">Rent</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                label="Payment Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Paid</TableCell>
              <TableCell align="right">Pending</TableCell>
              {selectedTab === 0 && <TableCell>Recurrence Day</TableCell>}
              <TableCell>Start Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={selectedTab === 0 ? 10 : 9} align="center">
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ py: 3 }}
                  >
                    No expenses found. Click "Add Expense" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedExpenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {expense.title}
                    </Typography>
                    {expense.employeeDetails?.name && (
                      <Typography variant="caption" color="textSecondary">
                        {expense.employeeDetails.name} -{" "}
                        {expense.employeeDetails.position}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={expense.category}
                      size="small"
                      color={
                        expense.category === "salary"
                          ? "primary"
                          : expense.category === "investment"
                            ? "success"
                            : "default"
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    ₹{expense.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`₹${(expense.initialPayment || 0).toLocaleString("en-IN")}`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`₹${(expense.pendingPayment || 0).toLocaleString("en-IN")}`}
                      size="small"
                      color={expense.pendingPayment > 0 ? "warning" : "default"}
                    />
                  </TableCell>
                  {selectedTab === 0 && (
                    <TableCell>{expense.recurrenceDay || "-"}</TableCell>
                  )}
                  <TableCell>
                    {new Date(expense.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={
                        expense.paymentStatus === "paid" ? (
                          <PaidIcon />
                        ) : (
                          <PendingIcon />
                        )
                      }
                      label={expense.paymentStatus}
                      size="small"
                      color={
                        expense.paymentStatus === "paid" ? "success" : "warning"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={expense.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={expense.isActive ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {expense.pendingPayment > 0 && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenPaymentDialog(expense)}
                          title="Record Payment"
                        >
                          <PaidIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() =>
                          expense.isActive
                            ? handleToggleActive(expense._id)
                            : handleToggleActive(expense._id)
                        }
                        title={expense.isActive ? "Deactivate" : "Activate"}
                      >
                        {expense.isActive ? (
                          <ToggleOnIcon fontSize="small" color="success" />
                        ) : (
                          <ToggleOffIcon fontSize="small" />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(expense)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(expense._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={expenses.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  disabled={!!editingExpense}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="one-time">One-time</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="salary">Salary</MenuItem>
                  <MenuItem value="expenses">Expenses</MenuItem>
                  <MenuItem value="new_inventory">New Inventory</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="investment">Investment</MenuItem>
                  <MenuItem value="utilities">Utilities</MenuItem>
                  <MenuItem value="rent">Rent</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Monthly Salary - Manager"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount (₹)"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Initial Payment (₹)"
                  name="initialPayment"
                  type="number"
                  value={formData.initialPayment}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="Amount paid upfront"
                />
              </Grid>

              {formData.type === "monthly" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Recurrence Day (1-31)"
                    name="recurrenceDay"
                    type="number"
                    value={formData.recurrenceDay}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 1, max: 31 }}
                    helperText="Day of month for payment"
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <DatePickerField
                  fullWidth
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(val) =>
                    setFormData({ ...formData, startDate: val })
                  }
                  required
                />
              </Grid>

              {formData.type === "monthly" && (
                <Grid item xs={12} sm={6}>
                  <DatePickerField
                    label="End Date (Optional)"
                    value={formData.endDate}
                    onChange={(val) =>
                      setFormData({ ...formData, endDate: val })
                    }
                    helperText="Leave empty for ongoing"
                  />
                </Grid>
              )}

              {/* Employee Details for Salary */}
              {formData.category === "salary" && (
                <>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      gutterBottom
                    >
                      Employee Details
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employee Name"
                      name="employee_name"
                      value={formData.employeeDetails.name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      name="employee_position"
                      value={formData.employeeDetails.position}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Employee ID (Optional)"
                      name="employee_employeeId"
                      value={formData.employeeDetails.employeeId}
                      onChange={handleChange}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createExpense.isPending || updateExpense.isPending}
            >
              {editingExpense ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Payment Recording Dialog */}
      <Dialog
        open={openPaymentDialog}
        onClose={handleClosePaymentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          {selectedExpenseForPayment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Expense: <strong>{selectedExpenseForPayment.title}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Total Amount:{" "}
                <strong>
                  ₹{selectedExpenseForPayment.amount.toLocaleString("en-IN")}
                </strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Already Paid:{" "}
                <strong>
                  ₹
                  {(
                    selectedExpenseForPayment.initialPayment || 0
                  ).toLocaleString("en-IN")}
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
                  ₹
                  {(
                    selectedExpenseForPayment.pendingPayment || 0
                  ).toLocaleString("en-IN")}
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
                  max: selectedExpenseForPayment.pendingPayment,
                  step: 0.01,
                }}
                helperText={`Maximum: ₹${(selectedExpenseForPayment.pendingPayment || 0).toLocaleString("en-IN")}`}
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
            disabled={recordPayment.isPending}
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;
