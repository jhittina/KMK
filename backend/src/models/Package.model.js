const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
      maxlength: [200, "Package name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Package category is required"],
      trim: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        itemName: String,
        category: String,
        subcategory: String,
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity must be at least 1"],
        },
        unitPrice: Number,
        priceType: String,
      },
    ],
    guestCount: {
      type: Number,
      min: [1, "Guest count must be at least 1"],
    },
    pricing: {
      subtotal: {
        type: Number,
        default: 0,
      },
      discountType: {
        type: String,
        enum: ["percentage", "flat", "none"],
        default: "none",
      },
      discountValue: {
        type: Number,
        default: 0,
        min: 0,
      },
      discountAmount: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
      taxPercentage: {
        type: Number,
        default: 18,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  },
);

// Indexes
packageSchema.index({ name: 1 });
packageSchema.index({ category: 1 });
packageSchema.index({ isActive: 1 });

module.exports = mongoose.model("Package", packageSchema);
