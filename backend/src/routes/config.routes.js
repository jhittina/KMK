const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");

const categoryController = require("../controllers/config/category.controller");
const itemController = require("../controllers/config/item.controller");
const expenseController = require("../controllers/config/expense.controller");

// ============ Category Routes ============
// All users can view
router.get("/categories", protect, categoryController.getAllCategories);
router.get("/categories/:id", protect, categoryController.getCategoryById);

// Only admin can create, update, delete
router.post(
  "/categories",
  protect,
  authorize("admin"),
  categoryController.createCategory,
);
router.put(
  "/categories/:id",
  protect,
  authorize("admin"),
  categoryController.updateCategory,
);
router.delete(
  "/categories/:id",
  protect,
  authorize("admin"),
  categoryController.deleteCategory,
);
router.post(
  "/categories/:id/subcategories",
  protect,
  authorize("admin"),
  categoryController.addSubcategory,
);

// ============ Item Routes ============
// All users can view
router.get("/items", protect, itemController.getAllItems);
router.get("/items/categories", protect, itemController.getCategories);
router.get(
  "/items/category/:category",
  protect,
  itemController.getItemsByCategory,
);
router.get("/items/:id", protect, itemController.getItemById);

// Only admin can create, update, delete
router.post("/items", protect, authorize("admin"), itemController.createItem);
router.put(
  "/items/:id",
  protect,
  authorize("admin"),
  itemController.updateItem,
);
router.delete(
  "/items/:id",
  protect,
  authorize("admin"),
  itemController.deleteItem,
);

// ============ Expense Routes ============
// Get all expenses and summary
router.get("/expenses", protect, expenseController.getExpenses);
router.get("/expenses/summary", protect, expenseController.getExpenseSummary);
router.get("/expenses/:id", protect, expenseController.getExpense);

// Admin only - create, update, delete
router.post(
  "/expenses",
  protect,
  authorize("admin"),
  expenseController.createExpense,
);
router.put(
  "/expenses/:id",
  protect,
  authorize("admin"),
  expenseController.updateExpense,
);
router.delete(
  "/expenses/:id",
  protect,
  authorize("admin"),
  expenseController.deleteExpense,
);

// Mark as paid and toggle active
router.put(
  "/expenses/:id/mark-paid",
  protect,
  authorize("admin"),
  expenseController.markExpenseAsPaid,
);
router.put(
  "/expenses/:id/record-payment",
  protect,
  authorize("admin"),
  expenseController.recordExpensePayment,
);
router.put(
  "/expenses/:id/toggle-active",
  protect,
  authorize("admin"),
  expenseController.toggleExpenseActive,
);

module.exports = router;
