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
      finalPrice: {
        type: Number,
        default: null,
        min: [0, "Final price cannot be negative"],
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
    paymentHistory: [
      {
        amount: {
          type: Number,
          required: true,
          min: [0, "Payment amount cannot be negative"],
        },
        paymentDate: {
          type: Date,
          default: Date.now,
        },
        paymentMethod: {
          type: String,
          enum: ["cash", "card", "upi", "bank_transfer", "cheque", "other"],
          default: "cash",
        },
        transactionId: String,
        notes: String,
        recordedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
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
  // Calculate total paid from payment history
  const totalPaid = this.paymentHistory.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0,
  );

  // Use finalPrice if set, otherwise use totalAmount
  const amountToPay = this.pricing.finalPrice || this.pricing.totalAmount;

  this.pricing.initialPayment = totalPaid;
  this.pricing.pendingPayment = Math.max(0, amountToPay - totalPaid);

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
bookingSchema.methods.recordPayment = function (
  paymentAmount,
  paymentMethod = "cash",
  transactionId = "",
  notes = "",
  recordedBy = null,
) {
  // Add payment to history
  this.paymentHistory.push({
    amount: paymentAmount,
    paymentDate: new Date(),
    paymentMethod,
    transactionId,
    notes,
    recordedBy,
  });

  // The pre-save hook will automatically calculate total paid and pending
  return this.save();
};

// Indexes
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ "customer.email": 1 });
bookingSchema.index({ "customer.phone": 1 });
bookingSchema.index({ "eventDetails.eventDate": 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
