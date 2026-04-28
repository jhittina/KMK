const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
    },
    customer: {
      name: {
        type: String,
        required: [true, "Customer name is required"],
      },
      email: {
        type: String,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      },
      phone: {
        type: String,
        required: [true, "Customer phone is required"],
        match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
      },
    },
    eventDetails: {
      eventDate: {
        type: Date,
        required: [true, "Event date is required"],
      },
      eventType: {
        type: String,
        enum: ["Wedding", "Reception", "Engagement", "Pre-Wedding", "Other"],
        default: "Wedding",
      },
      venue: {
        type: String,
        required: [true, "Venue is required"],
      },
      guestCount: {
        type: Number,
        required: [true, "Guest count is required"],
        min: [1, "Guest count must be at least 1"],
      },
      additionalInfo: String,
    },
    packages: [
      {
        packageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Package",
        },
        packageName: String,
        packageCategory: String,
        items: [
          {
            itemId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Item",
            },
            itemName: String,
            category: String,
            subcategory: String,
            quantity: Number,
            unitPrice: Number,
            priceType: String,
            totalPrice: Number,
          },
        ],
      },
    ],
    pricing: {
      subtotal: {
        type: Number,
        required: true,
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
        required: true,
        default: 0,
      },
      initialPayment: {
        type: Number,
        default: 0,
        min: [0, "Initial payment cannot be negative"],
      },
      pendingPayment: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ["draft", "confirmed", "cancelled", "completed"],
      default: "draft",
    },
    notes: String,
  },
  {
    timestamps: true,
  },
);

// Calculate pending payment before saving
bookingSchema.pre("save", function (next) {
  if (
    this.isModified("pricing.totalAmount") ||
    this.isModified("pricing.initialPayment")
  ) {
    this.pricing.pendingPayment =
      this.pricing.totalAmount - (this.pricing.initialPayment || 0);
  }
  next();
});

// Generate unique booking number
bookingSchema.pre("save", async function (next) {
  if (!this.bookingNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");

    // Find the last booking of the month
    const lastBooking = await this.constructor
      .findOne({ bookingNumber: new RegExp(`^KRL${year}${month}`) })
      .sort({ bookingNumber: -1 });

    let sequence = 1;
    if (lastBooking) {
      const lastSequence = parseInt(lastBooking.bookingNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    this.bookingNumber = `KRL${year}${month}${String(sequence).padStart(4, "0")}`;
  }
  next();
});

// Method to record a payment
bookingSchema.methods.recordPayment = function (paymentAmount) {
  this.pricing.initialPayment =
    (this.pricing.initialPayment || 0) + paymentAmount;
  this.pricing.pendingPayment =
    this.pricing.totalAmount - this.pricing.initialPayment;

  if (this.pricing.pendingPayment <= 0) {
    this.pricing.pendingPayment = 0;
  }

  return this.save();
};

// Indexes
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ "customer.email": 1 });
bookingSchema.index({ "customer.phone": 1 });
bookingSchema.index({ "eventDetails.eventDate": 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
