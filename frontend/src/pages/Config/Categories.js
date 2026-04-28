import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircleOutline as AddSubIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useAddSubcategory,
} from "../../hooks/useConfig";
import Loading from "../../components/Common/Loading";
import ErrorMessage from "../../components/Common/ErrorMessage";
import AlertDialog from "../../components/Common/AlertDialog";
import { useAlert } from "../../hooks/useAlert";
import { formatDateTime } from "../../utils/helpers";

function Categories() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subcategories: [],
  });
  const [subFormData, setSubFormData] = useState({
    name: "",
    description: "",
  });

  const { data, isLoading, error, refetch } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const addSubcategoryMutation = useAddSubcategory();
  const { alertState, showConfirm, showError, showSuccess, hideAlert } =
    useAlert();

  const handleOpen = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        subcategories: category.subcategories || [],
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "", subcategories: [] });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", subcategories: [] });
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory._id,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      showSuccess(
        editingCategory
          ? "Category updated successfully"
          : "Category created successfully",
      );
      handleClose();
    } catch (error) {
      showError(error.message || "Failed to save category");
    }
  };

  const handleDelete = async (category) => {
    showConfirm(
      `Are you sure you want to delete category "${category.name}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteMutation.mutateAsync(category._id);
          showSuccess("Category deleted successfully");
        } catch (error) {
          showError(error.message || "Failed to delete category");
        }
      },
      "Delete Category",
      "Delete",
    );
  };

  const handleOpenSubcategory = (category) => {
    setSelectedCategory(category);
    setSubFormData({ name: "", description: "" });
    setSubOpen(true);
  };

  const handleCloseSubcategory = () => {
    setSubOpen(false);
    setSelectedCategory(null);
    setSubFormData({ name: "", description: "" });
  };

  const handleAddSubcategory = async () => {
    try {
      await addSubcategoryMutation.mutateAsync({
        id: selectedCategory._id,
        data: subFormData,
      });
      handleCloseSubcategory();
    } catch (error) {
      console.error("Error adding subcategory:", error);
    }
  };

  // Filter and sort categories based on search
  const filteredCategories = React.useMemo(() => {
    let filtered =
      data?.data?.filter((category) => {
        const matchesSearch = searchQuery
          ? category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
          : true;
        return matchesSearch;
      }) || [];

    // Sort by latest updated first (updatedAt descending)
    return filtered.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  }, [data?.data, searchQuery]);

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
          Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          fullWidth={isMobile}
        >
          Add Category
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search categories..."
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

      <Grid container spacing={3}>
        {filteredCategories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category._id}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {category.name}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(category)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(category)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {category.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {category.description}
                  </Typography>
                )}

                {category.subcategories &&
                  category.subcategories.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      {category.subcategories.map((sub, index) => (
                        <Chip
                          key={index}
                          label={sub.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}

                <Box
                  sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: "divider" }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Created: {formatDateTime(category.createdAt)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Updated: {formatDateTime(category.updatedAt)}
                  </Typography>
                </Box>

                <Button
                  size="small"
                  startIcon={<AddSubIcon />}
                  onClick={() => handleOpenSubcategory(category)}
                  sx={{ mt: 1 }}
                >
                  Add Subcategory
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredCategories.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery
              ? "No categories match your search"
              : "No categories found"}
          </Typography>
          {searchQuery && (
            <Button
              variant="text"
              onClick={() => setSearchQuery("")}
              sx={{ mt: 2 }}
            >
              Clear Search
            </Button>
          )}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? "Edit Category" : "Add Category"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.name ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editingCategory ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog
        open={subOpen}
        onClose={handleCloseSubcategory}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Subcategory to {selectedCategory?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Subcategory Name"
              fullWidth
              value={subFormData.name}
              onChange={(e) =>
                setSubFormData({ ...subFormData, name: e.target.value })
              }
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={subFormData.description}
              onChange={(e) =>
                setSubFormData({ ...subFormData, description: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubcategory}>Cancel</Button>
          <Button
            onClick={handleAddSubcategory}
            variant="contained"
            disabled={!subFormData.name || addSubcategoryMutation.isPending}
          >
            Add Subcategory
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

export default Categories;
