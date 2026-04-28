import React, { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Grid,
  InputAdornment,
  useTheme,
  useMediaQuery,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  useItems,
  useCategories,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
} from "../../hooks/useConfig";
import Loading from "../../components/Common/Loading";
import ErrorMessage from "../../components/Common/ErrorMessage";
import AlertDialog from "../../components/Common/AlertDialog";
import { useAlert } from "../../hooks/useAlert";
import {
  formatCurrency,
  getPriceTypeLabel,
  formatDateTime,
} from "../../utils/helpers";

function Items() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subcategory: "",
    description: "",
    basePrice: "",
    priceType: "per_person",
    unit: "plate",
  });

  const { data, isLoading, error, refetch } = useItems({
    search: searchQuery || undefined,
    category: categoryFilter || undefined,
    subcategory: subcategoryFilter || undefined,
  });
  const { data: categoriesData } = useCategories();
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  const deleteMutation = useDeleteItem();
  const { alertState, showConfirm, showError, showSuccess, hideAlert } =
    useAlert();

  // Reset page when filters change
  React.useEffect(() => {
    setPage(0);
  }, [searchQuery, categoryFilter, subcategoryFilter]);

  // Sort items by latest updated first
  const sortedItems = React.useMemo(() => {
    if (!data?.data) return [];
    return [...data.data].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  }, [data?.data]);

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        subcategory: item.subcategory || "",
        description: item.description || "",
        basePrice: item.basePrice,
        priceType: item.priceType,
        unit: item.unit || "plate",
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        category: "",
        subcategory: "",
        description: "",
        basePrice: "",
        priceType: "per_person",
        unit: "plate",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    try {
      const dataToSubmit = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
      };

      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem._id,
          data: dataToSubmit,
        });
        showSuccess("Item updated successfully");
      } else {
        await createMutation.mutateAsync(dataToSubmit);
        showSuccess("Item created successfully");
      }
      handleClose();
    } catch (error) {
      showError(error.message || "Failed to save item");
    }
  };

  const handleDelete = async (item) => {
    showConfirm(
      `Are you sure you want to delete item "${item.name}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteMutation.mutateAsync(item._id);
          showSuccess("Item deleted successfully");
        } catch (error) {
          showError(error.message || "Failed to delete item");
        }
      },
      "Delete Item",
      "Delete",
    );
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  const selectedCategory = categoriesData?.data?.find(
    (cat) => cat.name === formData.category,
  );

  const filterCategory = categoriesData?.data?.find(
    (cat) => cat.name === categoryFilter,
  );

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
          Items
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          fullWidth={isMobile}
        >
          Add Item
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search items..."
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
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Filter by Category"
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setSubcategoryFilter("");
                }}
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small" disabled={!categoryFilter}>
              <InputLabel>Filter by Subcategory</InputLabel>
              <Select
                value={subcategoryFilter}
                label="Filter by Subcategory"
                onChange={(e) => setSubcategoryFilter(e.target.value)}
              >
                <MenuItem value="">All Subcategories</MenuItem>
                {filterCategory?.subcategories?.map((sub, index) => (
                  <MenuItem key={index} value={sub.name}>
                    {sub.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: { xs: 650, md: "auto" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <strong>Name</strong>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <strong>Category</strong>
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  display: { xs: "none", sm: "table-cell" },
                }}
              >
                <strong>Subcategory</strong>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <strong>Base Price</strong>
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  display: { xs: "none", md: "table-cell" },
                }}
              >
                <strong>Price Type</strong>
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
            {(sortedItems || [])
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    {item.subcategory || "-"}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatCurrency(item.basePrice)}
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    <Chip
                      label={getPriceTypeLabel(item.priceType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(item.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(item.updatedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpen(item)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={sortedItems?.length || 0}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {sortedItems?.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery || categoryFilter || subcategoryFilter
              ? "No items match your filters"
              : "No items found"}
          </Typography>
          {(searchQuery || categoryFilter || subcategoryFilter) && (
            <Button
              variant="text"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("");
                setSubcategoryFilter("");
              }}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                label="Item Name"
                fullWidth
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                      subcategory: "",
                    })
                  }
                >
                  {categoriesData?.data?.map((cat) => (
                    <MenuItem key={cat._id} value={cat.name}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={formData.subcategory}
                  label="Subcategory"
                  onChange={(e) =>
                    setFormData({ ...formData, subcategory: e.target.value })
                  }
                  disabled={!selectedCategory}
                >
                  <MenuItem value="">None</MenuItem>
                  {selectedCategory?.subcategories?.map((sub, index) => (
                    <MenuItem key={index} value={sub.name}>
                      {sub.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                label="Base Price"
                type="number"
                fullWidth
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({ ...formData, basePrice: e.target.value })
                }
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Price Type</InputLabel>
                <Select
                  value={formData.priceType}
                  label="Price Type"
                  onChange={(e) =>
                    setFormData({ ...formData, priceType: e.target.value })
                  }
                >
                  <MenuItem value="per_person">Per Person</MenuItem>
                  <MenuItem value="flat_rate">Flat Rate</MenuItem>
                  <MenuItem value="per_hour">Per Hour</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Unit"
                fullWidth
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                placeholder="e.g., plate, setup, hour"
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
              !formData.category ||
              !formData.basePrice ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editingItem ? "Update" : "Create"}
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

export default Items;
