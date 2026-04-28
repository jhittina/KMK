const Booking = require("../../models/Booking.model");
const Package = require("../../models/Package.model");
const Customer = require("../../models/Customer.model");
const { calculateBookingPrice } = require("../../services/pricing.service");
const {
  sendInternalNotification,
  sendCustomerNotification,
} = require("../../services/email.service");

/**
 * Get all bookings
 */
exports.getAllBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (startDate || endDate) {
      filter["eventDetails.eventDate"] = {};
      if (startDate)
        filter["eventDetails.eventDate"].$gte = new Date(startDate);
      if (endDate) filter["eventDetails.eventDate"].$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .populate("packages.packageId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get booking by ID
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("packages.packageId")
      .populate("packages.items.itemId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get booking by booking number
 */
exports.getBookingByNumber = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingNumber: req.params.bookingNumber,
    })
      .populate("packages.packageId")
      .populate("packages.items.itemId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Create new booking
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      customer,
      eventDetails,
      packageIds,
      packageId,
      items,
      discountType,
      discountValue,
      taxPercentage,
      finalPrice,
      initialPayment,
      notes,
    } = req.body;

    // Validate required fields
    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({
        success: false,
        error: "Customer name and phone are required",
      });
    }

    if (
      !eventDetails ||
      !eventDetails.eventDate ||
      !eventDetails.venue ||
      !eventDetails.guestCount
    ) {
      return res.status(400).json({
        success: false,
        error: "Event date, venue, and guest count are required",
      });
    }

    let packagesData = [];
    let allBookingItems = [];

    // Support both single packageId (backward compatibility) and multiple packageIds
    const packageIdsToProcess = packageIds || (packageId ? [packageId] : []);

    // If packageIds are provided, fetch package details
    if (packageIdsToProcess.length > 0) {
      for (const pkgId of packageIdsToProcess) {
        const pkg = await Package.findById(pkgId).populate("items.itemId");

        if (!pkg) {
          return res.status(404).json({
            success: false,
            error: `Package not found: ${pkgId}`,
          });
        }

        const packageData = {
          packageId: pkg._id,
          packageName: pkg.name,
          packageCategory: pkg.category,
          items: pkg.items.map((item) => ({
            itemId: item.itemId._id,
            itemName: item.itemName,
            category: item.category,
            subcategory: item.subcategory,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            priceType: item.priceType,
          })),
        };

        packagesData.push(packageData);

        // Collect all items for pricing calculation
        const packageItems = pkg.items.map((item) => ({
          itemId: item.itemId._id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }));
        allBookingItems.push(...packageItems);
      }
    } else if (items && items.length > 0) {
      // Custom booking without package
      packagesData.push({
        packageName: "Custom Package",
        packageCategory: "Custom",
        items: items,
      });
      allBookingItems = items;
    } else {
      return res.status(400).json({
        success: false,
        error: "Either packageIds or items must be provided",
      });
    }

    // Calculate pricing
    const calculation = await calculateBookingPrice({
      items: allBookingItems,
      guestCount: eventDetails.guestCount,
      discountType,
      discountValue,
      taxPercentage,
    });

    // Add total price to each item in packages
    packagesData = packagesData.map((pkg) => ({
      ...pkg,
      items: pkg.items.map((item) => {
        const breakdownItem = calculation.breakdown.find(
          (b) => b.itemId.toString() === item.itemId.toString(),
        );
        return {
          ...item,
          totalPrice: breakdownItem ? breakdownItem.totalPrice : 0,
        };
      }),
    }));

    const booking = await Booking.create({
      customer,
      eventDetails,
      packages: packagesData,
      pricing: {
        subtotal: calculation.subtotal,
        discountType: discountType || "none",
        discountValue: discountValue || 0,
        discountAmount: calculation.discountAmount,
        tax: calculation.tax,
        taxPercentage: calculation.taxPercentage,
        totalAmount: calculation.totalAmount,
        finalPrice: finalPrice ? parseFloat(finalPrice) : null,
        initialPayment: 0, // Will be calculated from payment history
      },
      paymentHistory:
        initialPayment && initialPayment > 0
          ? [
              {
                amount: parseFloat(initialPayment),
                paymentDate: new Date(),
                paymentMethod: "cash",
                notes: "Initial payment at booking",
                recordedBy: req.user ? req.user.id : null,
              },
            ]
          : [],
      notes,
    });

    // Create or update customer record for tracking
    try {
      let customerRecord = await Customer.findOne({ phone: customer.phone });

      // Use finalPrice if set, otherwise use totalAmount
      const bookingValue = finalPrice
        ? parseFloat(finalPrice)
        : calculation.totalAmount;

      if (customerRecord) {
        // Update existing customer
        customerRecord.name = customer.name || customerRecord.name;
        customerRecord.email = customer.email || customerRecord.email;
        customerRecord.bookings.push(booking._id);
        customerRecord.totalBookings = customerRecord.bookings.length;
        customerRecord.totalSpent += bookingValue;
        await customerRecord.save();
      } else {
        // Create new customer
        await Customer.create({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          bookings: [booking._id],
          totalBookings: 1,
          totalSpent: bookingValue,
        });
      }
    } catch (customerError) {
      // Log error but don't fail the booking creation
      console.error("Error updating customer record:", customerError.message);
    }

    res.status(201).json({
      success: true,
      data: booking,
      message: `Booking created successfully with number: ${booking.bookingNumber}`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update booking
 */
exports.updateBooking = async (req, res) => {
  try {
    const { customer, eventDetails, packageIds, pricing, notes } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // If packageIds are being updated, recalculate pricing
    if (packageIds && packageIds.length > 0) {
      let packagesData = [];
      let allBookingItems = [];

      for (const pkgId of packageIds) {
        const pkg = await Package.findById(pkgId).populate("items.itemId");

        if (!pkg) {
          return res.status(404).json({
            success: false,
            error: `Package not found: ${pkgId}`,
          });
        }

        const packageData = {
          packageId: pkg._id,
          packageName: pkg.name,
          packageCategory: pkg.category,
          items: pkg.items.map((item) => ({
            itemId: item.itemId._id,
            itemName: item.itemName,
            category: item.category,
            subcategory: item.subcategory,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            priceType: item.priceType,
          })),
        };

        packagesData.push(packageData);

        const packageItems = pkg.items.map((item) => ({
          itemId: item.itemId._id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }));
        allBookingItems.push(...packageItems);
      }

      // Use updated eventDetails if provided, otherwise use existing
      const guestCount =
        eventDetails?.guestCount || booking.eventDetails.guestCount;
      const discountType =
        pricing?.discountType || booking.pricing.discountType;
      const discountValue =
        pricing?.discountValue || booking.pricing.discountValue;
      const taxPercentage =
        pricing?.taxPercentage !== undefined
          ? pricing.taxPercentage
          : booking.pricing.taxPercentage;

      // Calculate new pricing
      const calculation = await calculateBookingPrice({
        items: allBookingItems,
        guestCount,
        discountType,
        discountValue,
        taxPercentage,
      });

      // Add total price to each item in packages
      packagesData = packagesData.map((pkg) => ({
        ...pkg,
        items: pkg.items.map((item) => {
          const breakdownItem = calculation.breakdown.find(
            (b) => b.itemId.toString() === item.itemId.toString(),
          );
          return {
            ...item,
            totalPrice: breakdownItem ? breakdownItem.totalPrice : 0,
          };
        }),
      }));

      booking.packages = packagesData;
      booking.pricing.subtotal = calculation.subtotal;
      booking.pricing.discountType = discountType;
      booking.pricing.discountValue = discountValue;
      booking.pricing.discountAmount = calculation.discountAmount;
      booking.pricing.tax = calculation.tax;
      booking.pricing.taxPercentage = calculation.taxPercentage;
      booking.pricing.totalAmount = calculation.totalAmount;

      // Preserve or update finalPrice when recalculating
      if (pricing && pricing.finalPrice !== undefined) {
        booking.pricing.finalPrice = pricing.finalPrice
          ? parseFloat(pricing.finalPrice)
          : null;
      }

      // Mark pricing as modified for Mongoose to detect changes
      booking.markModified("pricing");
    } else if (pricing) {
      // Update pricing fields only
      if (pricing.discountType !== undefined)
        booking.pricing.discountType = pricing.discountType;
      if (pricing.discountValue !== undefined)
        booking.pricing.discountValue = pricing.discountValue;
      if (pricing.taxPercentage !== undefined)
        booking.pricing.taxPercentage = pricing.taxPercentage;
      if (pricing.finalPrice !== undefined) {
        booking.pricing.finalPrice = pricing.finalPrice
          ? parseFloat(pricing.finalPrice)
          : null;
      }

      // Mark pricing as modified for Mongoose to detect changes
      booking.markModified("pricing");
    }

    // Update finalPrice if provided (even when recalculating)
    if (pricing && pricing.finalPrice !== undefined) {
      booking.pricing.finalPrice = pricing.finalPrice
        ? parseFloat(pricing.finalPrice)
        : null;
      booking.markModified("pricing");
    }

    // Update initialPayment if provided
    if (pricing && pricing.initialPayment !== undefined) {
      booking.pricing.initialPayment = parseFloat(pricing.initialPayment) || 0;
      booking.markModified("pricing");
    }

    // Update other fields
    if (customer) booking.customer = customer;
    if (eventDetails)
      booking.eventDetails = { ...booking.eventDetails, ...eventDetails };
    if (notes !== undefined) booking.notes = notes;

    await booking.save();

    res.json({
      success: true,
      data: booking,
      message: "Booking updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update booking status
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, notifyCustomer } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    // Fetch current booking first so we know the previous status
    const existing = await Booking.findById(req.params.id).populate(
      "packages.packageId",
    );
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    const previousStatus = existing.status;
    existing.status = status;
    const booking = await existing.save({ runValidators: true });

    // Always send internal team notification
    sendInternalNotification(booking, status, previousStatus).catch(() => {});

    // Send customer notification only if explicitly requested
    if (notifyCustomer) {
      sendCustomerNotification(booking, status).catch(() => {});
    }

    res.json({
      success: true,
      data: booking,
      message: `Booking status updated to ${status}`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete booking
 */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Calculate booking price
 */
exports.calculatePrice = async (req, res) => {
  try {
    const calculation = await calculateBookingPrice(req.body);

    res.json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Record a payment for booking
 */
exports.recordBookingPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    const {
      amount,
      paymentMethod = "cash",
      transactionId = "",
      notes = "",
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Payment amount must be greater than 0",
      });
    }

    if (amount > booking.pricing.pendingPayment) {
      return res.status(400).json({
        success: false,
        error: `Payment amount cannot exceed pending payment of ₹${booking.pricing.pendingPayment}`,
      });
    }

    await booking.recordPayment(
      amount,
      paymentMethod,
      transactionId,
      notes,
      req.user.id,
    );

    res.json({
      success: true,
      data: booking,
      message: `Payment of ₹${amount} recorded successfully`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
