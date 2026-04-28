const Expense = require("../../models/Expense.model");
const asyncHandler = require("../../middleware/asyncHandler");

// @desc    Get all expenses with filters
// @route   GET /api/config/expenses
// @access  Private
exports.getExpenses = asyncHandler(async (req, res) => {
  const {
    type,
    category,
    paymentStatus,
    startDate,
    endDate,
    search,
    isActive,
  } = req.query;

  const query = {};

  if (type) query.type = type;
  if (category) query.category = category;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (isActive !== undefined) query.isActive = isActive === "true";

  // Date range filter
  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }

  // Search in title, description, employee name
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "employeeDetails.name": { $regex: search, $options: "i" } },
    ];
  }

  const expenses = await Expense.find(query)
    .populate("createdBy", "name email")
    .sort({ startDate: -1 });

  res.status(200).json({
    success: true,
    count: expenses.length,
    data: expenses,
  });
});

// @desc    Get expense summary
// @route   GET /api/config/expenses/summary
// @access  Private
exports.getExpenseSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate
    ? new Date(startDate)
    : new Date(new Date().getFullYear(), 0, 1);
  const end = endDate
    ? new Date(endDate)
    : new Date(new Date().getFullYear(), 11, 31);

  // Monthly expenses total
  const monthlyTotal = await Expense.getMonthlyTotal(start, end);

  // One-time expenses total
  const oneTimeTotal = await Expense.getOneTimeTotal(start, end);

  // Category breakdown
  const categoryBreakdown = await Expense.getByCategory(start, end);

  // Pending payments count
  const pendingCount = await Expense.countDocuments({
    paymentStatus: "pending",
    isActive: true,
  });

  // Monthly expenses by category
  const monthlyByCategory = await Expense.aggregate([
    {
      $match: {
        type: "monthly",
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  // One-time expenses by category
  const oneTimeByCategory = await Expense.aggregate([
    {
      $match: {
        type: "one-time",
        isActive: true,
        startDate: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      monthlyTotal,
      oneTimeTotal,
      totalExpenses: monthlyTotal + oneTimeTotal,
      pendingPaymentsCount: pendingCount,
      categoryBreakdown,
      monthlyByCategory: monthlyByCategory.map((item) => ({
        category: item._id,
        total: item.total,
        count: item.count,
      })),
      oneTimeByCategory: oneTimeByCategory.map((item) => ({
        category: item._id,
        total: item.total,
        count: item.count,
      })),
    },
  });
});

// @desc    Get single expense
// @route   GET /api/config/expenses/:id
// @access  Private
exports.getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id).populate(
    "createdBy",
    "name email",
  );

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    });
  }

  res.status(200).json({
    success: true,
    data: expense,
  });
});

// @desc    Create new expense
// @route   POST /api/config/expenses
// @access  Private
exports.createExpense = asyncHandler(async (req, res) => {
  // Add user ID to request body
  req.body.createdBy = req.user.id;

  // Validate employee details for salary category
  if (req.body.category === "salary") {
    if (
      !req.body.employeeDetails ||
      !req.body.employeeDetails.name ||
      !req.body.employeeDetails.position
    ) {
      return res.status(400).json({
        success: false,
        message: "Employee details are required for salary expenses",
      });
    }
  }

  const expense = await Expense.create(req.body);

  res.status(201).json({
    success: true,
    data: expense,
    message: "Expense created successfully",
  });
});

// @desc    Update expense
// @route   PUT /api/config/expenses/:id
// @access  Private
exports.updateExpense = asyncHandler(async (req, res) => {
  let expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    });
  }

  // Validate employee details for salary category
  if (req.body.category === "salary") {
    if (
      !req.body.employeeDetails ||
      !req.body.employeeDetails.name ||
      !req.body.employeeDetails.position
    ) {
      return res.status(400).json({
        success: false,
        message: "Employee details are required for salary expenses",
      });
    }
  }

  expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: expense,
    message: "Expense updated successfully",
  });
});

// @desc    Delete expense
// @route   DELETE /api/config/expenses/:id
// @access  Private
exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    });
  }

  await expense.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: "Expense deleted successfully",
  });
});

// @desc    Mark expense as paid
// @route   PUT /api/config/expenses/:id/mark-paid
// @access  Private
exports.markExpenseAsPaid = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    });
  }

  await expense.markAsPaid();

  res.status(200).json({
    success: true,
    data: expense,
    message: "Expense marked as paid successfully",
  });
});

// @desc    Record a payment for expense
// @route   PUT /api/config/expenses/:id/record-payment
// @access  Private
exports.recordExpensePayment = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    });
  }

  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Payment amount must be greater than 0",
    });
  }

  if (amount > expense.pendingPayment) {
    return res.status(400).json({
      success: false,
      message: `Payment amount cannot exceed pending payment of ₹${expense.pendingPayment}`,
    });
  }

  await expense.recordPayment(amount);

  res.status(200).json({
    success: true,
    data: expense,
    message: `Payment of ₹${amount} recorded successfully`,
  });
});

// @desc    Toggle expense active status
// @route   PUT /api/config/expenses/:id/toggle-active
// @access  Private
exports.toggleExpenseActive = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    });
  }

  expense.isActive = !expense.isActive;
  await expense.save();

  res.status(200).json({
    success: true,
    data: expense,
    message: `Expense ${expense.isActive ? "activated" : "deactivated"} successfully`,
  });
});
