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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useItems, useCategories } from "../../hooks/useConfig";
import {
  usePackage,
  useCreatePackage,
  useUpdatePackage,
  useCalculatePackage,
} from "../../hooks/useWorkspace";
import Loading from "../../components/Common/Loading";
import AlertDialog from "../../components/Common/AlertDialog";
import { useAlert } from "../../hooks/useAlert";
import { formatCurrency, getPriceTypeLabel } from "../../utils/helpers";

function PackageBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { alertState, showSuccess, showError, showWarning, hideAlert } =
    useAlert();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Custom",
    guestCount: 100,
    items: [],
    discountType: "none",
    discountValue: 0,
  });

  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [itemSearch, setItemSearch] = useState("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState("");

  const { data: itemsData, isLoading: itemsLoading } = useItems({
    isActive: true,
  });
  const { data: categoriesData } = useCategories();
  const { data: packageData, isLoading: packageLoading } = usePackage(id);
  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();

  // Use React Query for automatic caching of calculations
  const calculationParams =
    formData.items?.length > 0 && formData.guestCount
      ? {
          itemDetails: formData.items,
          guestCount: formData.guestCount,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
        }
      : null;

  const { data: calculationData } = useCalculatePackage(calculationParams);
  const calculation = calculationData?.data;

  useEffect(() => {
    if (packageData?.data) {
      // Normalize items - handle both populated and unpopulated itemId
      const normalizedItems = packageData.data.items.map((item) => ({
        itemId: typeof item.itemId === "object" ? item.itemId._id : item.itemId,
        quantity: item.quantity,
      }));

      setFormData({
        name: packageData.data.name,
        description: packageData.data.description || "",
        category: packageData.data.category,
        guestCount: packageData.data.guestCount || 100,
        items: normalizedItems,
        discountType: packageData.data.pricing?.discountType || "none",
        discountValue: packageData.data.pricing?.discountValue || 0,
      });
    }
  }, [packageData]);

  const handleAddItem = () => {
    if (!selectedItem) return;

    const item = itemsData.data.find((i) => i._id === selectedItem);
    if (!item) return;

    const exists = formData.items.find((i) => i.itemId === selectedItem);
    if (exists) {
      showWarning(
        "This item has already been added to the package.",
        "Item Already Added",
      );
      return;
    }

    setFormData({
      ...formData,
      items: [...formData.items, { itemId: selectedItem, quantity }],
    });

    setSelectedItem("");
    setQuantity(1);
  };

  const handleRemoveItem = (itemId) => {
    setFormData({
      ...formData,
      items: formData.items.filter((i) => i.itemId !== itemId),
    });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id, data: formData });
        showSuccess("Package updated successfully!", "Success");
      } else {
        await createMutation.mutateAsync(formData);
        showSuccess("Package created successfully!", "Success");
      }
      setTimeout(() => navigate("/workspace/packages"), 1500);
    } catch (error) {
      showError(error.message || "Failed to save package");
    }
  };

  if (packageLoading || itemsLoading) return <Loading />;

  const getItemDetails = (itemId) => {
    return itemsData?.data?.find((i) => i._id === itemId);
  };

  // Filter items based on search and category
  const filteredItems =
    itemsData?.data?.filter((item) => {
      const matchesSearch = itemSearch
        ? item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
          item.category.toLowerCase().includes(itemSearch.toLowerCase())
        : true;
      const matchesCategory = itemCategoryFilter
        ? item.category === itemCategoryFilter
        : true;
      return matchesSearch && matchesCategory;
    }) || [];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {isEditing ? "Edit Package" : "Create Package"}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Package Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Package Name"
                  fullWidth
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Category (e.g., Wedding, Haldi, Music)"
                  fullWidth
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                  placeholder="Enter package category"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Guest Count"
                  type="number"
                  fullWidth
                  value={formData.guestCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      guestCount: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Add Items
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search items..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter by Category</InputLabel>
                  <Select
                    value={itemCategoryFilter}
                    label="Filter by Category"
                    onChange={(e) => setItemCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categoriesData?.data?.map((cat) => (
                      <MenuItem key={cat._id} value={cat.name}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Item</InputLabel>
                  <Select
                    value={selectedItem}
                    label="Select Item"
                    onChange={(e) => setSelectedItem(e.target.value)}
                  >
                    {filteredItems.map((item) => (
                      <MenuItem key={item._id} value={item._id}>
                        {item.name} - {formatCurrency(item.basePrice)} (
                        {getPriceTypeLabel(item.priceType)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Quantity"
                  type="number"
                  fullWidth
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAddItem}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Grid>
            </Grid>

            {formData.items.length > 0 && (
              <TableContainer sx={{ mt: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item) => {
                      const itemDetails = getItemDetails(item.itemId);
                      return (
                        <TableRow key={item.itemId}>
                          <TableCell>{itemDetails?.name}</TableCell>
                          <TableCell>{itemDetails?.category}</TableCell>
                          <TableCell>
                            {formatCurrency(itemDetails?.basePrice || 0)}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveItem(item.itemId)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Discount
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    value={formData.discountType}
                    label="Discount Type"
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
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
                  <Typography variant="body2">Tax (18%):</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(calculation.tax)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6">Total:</Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    {formatCurrency(calculation.totalAmount)}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ my: 3 }}>
                Add items to see price calculation
              </Typography>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={
                  !formData.name ||
                  formData.items.length === 0 ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                {isEditing ? "Update Package" : "Create Package"}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/workspace/packages")}
              >
                Cancel
              </Button>
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
    </Box>
  );
}

export default PackageBuilder;
