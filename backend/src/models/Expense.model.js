const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["monthly", "one-time"],
      required: [true, "Expense type is required"],
    },
    category: {
      type: String,
      enum: [
        "salary",
        "maintenance",
        "investment",
        "utilities",
        "rent",
        "other",
      ],
      required: [true, "Category is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    initialPayment: {
      type: Number,
      default: 0,
      min: [0, "Initial payment cannot be negative"],
    },
    pendingPayment: {
      type: Number,
      default: function () {
        return this.amount - (this.initialPayment || 0);
      },
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    recurrenceDay: {
      type: Number,
      min: 1,
      max: 31,
      validate: {
        validator: function (value) {
          if (this.type === "one-time") return true;
          return value !== undefined && value !== null;
        },
        message: "Recurrence day is required for monthly expenses",
      },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    lastPaidDate: {
      type: Date,
    },
    employeeDetails: {
      name: {
        type: String,
        trim: true,
      },
      position: {
        type: String,
        trim: true,
      },
      employeeId: {
        type: String,
        trim: true,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
expenseSchema.index({ type: 1, isActive: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ startDate: 1, endDate: 1 });
expenseSchema.index({ createdBy: 1 });

// Virtual for checking if expense is currently active
expenseSchema.virtual("isCurrentlyActive").get(function () {
  if (!this.isActive) return false;

  const now = new Date();
  const isAfterStart = this.startDate <= now;
  const isBeforeEnd = !this.endDate || this.endDate >= now;

  return isAfterStart && isBeforeEnd;
});

// Pre-save middleware to calculate pending payment
expenseSchema.pre("save", function (next) {
  if (this.isModified("amount") || this.isModified("initialPayment")) {
    this.pendingPayment = this.amount - (this.initialPayment || 0);
  }
  next();
});

// Method to mark as paid
expenseSchema.methods.markAsPaid = function () {
  this.paymentStatus = "paid";
  this.lastPaidDate = new Date();
  return this.save();
};

// Method to record a payment
expenseSchema.methods.recordPayment = function (paymentAmount) {
  this.initialPayment = (this.initialPayment || 0) + paymentAmount;
  this.pendingPayment = this.amount - this.initialPayment;

  if (this.pendingPayment <= 0) {
    this.paymentStatus = "paid";
    this.pendingPayment = 0;
  }

  this.lastPaidDate = new Date();
  return this.save();
};

// Static method to get monthly total
expenseSchema.statics.getMonthlyTotal = async function (startDate, endDate) {
  const expenses = await this.find({
    type: "monthly",
    isActive: true,
    startDate: { $lte: endDate },
    $or: [
      { endDate: { $exists: false } },
      { endDate: null },
      { endDate: { $gte: startDate } },
    ],
  });

  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

// Static method to get one-time total for a period
expenseSchema.statics.getOneTimeTotal = async function (startDate, endDate) {
  const expenses = await this.find({
    type: "one-time",
    isActive: true,
    startDate: { $gte: startDate, $lte: endDate },
  });

  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

// Static method to get expenses by category
expenseSchema.statics.getByCategory = async function (startDate, endDate) {
  const expenses = await this.find({
    isActive: true,
    startDate: { $lte: endDate },
    $or: [
      { type: "one-time", startDate: { $gte: startDate } },
      {
        type: "monthly",
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: startDate } },
        ],
      },
    ],
  });

  const categoryTotals = {};
  expenses.forEach((expense) => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }

    if (expense.type === "monthly") {
      // Calculate months in range
      const monthsDiff = Math.ceil(
        (Math.min(endDate, expense.endDate || endDate) -
          Math.max(startDate, expense.startDate)) /
          (1000 * 60 * 60 * 24 * 30),
      );
      categoryTotals[expense.category] +=
        expense.amount * Math.max(1, monthsDiff);
    } else {
      categoryTotals[expense.category] += expense.amount;
    }
  });

  return Object.entries(categoryTotals).map(([category, total]) => ({
    category,
    total,
  }));
};

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
