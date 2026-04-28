const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [200, "Item name cannot exceed 200 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    subcategory: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
    },
    priceType: {
      type: String,
      required: [true, "Price type is required"],
      enum: ["per_person", "flat_rate", "per_hour"],
      default: "per_person",
    },
    unit: {
      type: String,
      default: "plate", // e.g., plate, hour, setup, person
    },
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
    },
    tags: [String],
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for faster queries
itemSchema.index({ category: 1, subcategory: 1 });
itemSchema.index({ isActive: 1 });
itemSchema.index({ name: "text", description: "text" });

// Compound index for category filtering
itemSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model("Item", itemSchema);
