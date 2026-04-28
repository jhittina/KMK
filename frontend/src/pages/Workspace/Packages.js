import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { usePackages, useDeletePackage } from "../../hooks/useWorkspace";
import Loading from "../../components/Common/Loading";
import ErrorMessage from "../../components/Common/ErrorMessage";
import AlertDialog from "../../components/Common/AlertDialog";
import { useAlert } from "../../hooks/useAlert";
import { formatCurrency, formatDateTime } from "../../utils/helpers";

function Packages() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { data, isLoading, error, refetch } = usePackages();
  const deleteMutation = useDeletePackage();
  const { alertState, showConfirm, showError, showSuccess, hideAlert } =
    useAlert();

  const handleDelete = async (pkg) => {
    showConfirm(
      `Are you sure you want to delete the package "${pkg.name}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteMutation.mutateAsync(pkg._id);
          showSuccess("Package deleted successfully");
        } catch (error) {
          showError(error.message || "Failed to delete package");
        }
      },
      "Delete Package",
      "Delete",
    );
  };

  // Get unique categories from packages
  const categories = [
    ...new Set(data?.data?.map((pkg) => pkg.category)),
  ].filter(Boolean);

  // Filter and sort packages based on search and category
  const filteredPackages = React.useMemo(() => {
    let filtered =
      data?.data?.filter((pkg) => {
        const matchesSearch = searchQuery
          ? pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.description?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        const matchesCategory = categoryFilter
          ? pkg.category === categoryFilter
          : true;
        return matchesSearch && matchesCategory;
      }) || [];

    // Sort by latest updated first (updatedAt descending)
    return filtered.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  }, [data?.data, searchQuery, categoryFilter]);

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
          Packages
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/workspace/packages/new")}
          fullWidth={isMobile}
        >
          Create Package
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search packages..."
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
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Filter by Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {filteredPackages.map((pkg) => (
          <Grid item xs={12} sm={6} md={4} key={pkg._id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {pkg.name}
                  </Typography>
                  <Chip label={pkg.category} size="small" color="primary" />
                </Box>

                {pkg.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {pkg.description}
                  </Typography>
                )}

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Items: {pkg.items?.length || 0}
                  </Typography>
                  <br />
                  {pkg.guestCount && (
                    <Typography variant="caption" color="text.secondary">
                      Guest Count: {pkg.guestCount}
                    </Typography>
                  )}
                </Box>

                {pkg.pricing && (
                  <Box
                    sx={{ mt: 2, p: 2, bgcolor: "primary.50", borderRadius: 1 }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      {formatCurrency(pkg.pricing.totalAmount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Amount
                    </Typography>
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
                    Created: {formatDateTime(pkg.createdAt)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Updated: {formatDateTime(pkg.updatedAt)}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() =>
                    navigate(`/workspace/packages/edit/${pkg._id}`)
                  }
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(pkg)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPackages.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery || categoryFilter
              ? "No packages match your filters"
              : "No packages found"}
          </Typography>
          {(searchQuery || categoryFilter) && (
            <Button
              variant="text"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("");
              }}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          )}
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

export default Packages;
