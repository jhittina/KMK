const Customer = require("../../models/Customer.model");
const Booking = require("../../models/Booking.model");

/**
 * Get all customers
 */
exports.getAllCustomers = async (req, res) => {
  try {
    const { search, isActive } = req.query;

    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .select("-bookings"); // Exclude bookings array for list view

    res.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get customer by ID with booking history
 */
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate({
      path: "bookings",
      options: { sort: { createdAt: -1 } },
      select:
        "bookingNumber eventDetails.eventDate eventDetails.eventType pricing.totalAmount status",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get customer by phone number
 */
exports.getCustomerByPhone = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      phone: req.params.phone,
    }).populate({
      path: "bookings",
      options: { sort: { createdAt: -1 } },
      select:
        "bookingNumber eventDetails.eventDate eventDetails.eventType pricing.totalAmount status",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Create new customer
 */
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, alternatePhone, address, notes, tags } =
      req.body;

    // Check if customer already exists with this phone
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        error: "Customer with this phone number already exists",
      });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      alternatePhone,
      address,
      notes,
      tags,
    });

    res.status(201).json({
      success: true,
      data: customer,
      message: "Customer created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update customer
 */
exports.updateCustomer = async (req, res) => {
  try {
    // If phone is being updated, check if it's already taken by another customer
    if (req.body.phone) {
      const existingCustomer = await Customer.findOne({
        phone: req.body.phone,
        _id: { $ne: req.params.id },
      });

      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          error:
            "This phone number is already registered with another customer",
        });
      }
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
      message: "Customer updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete customer
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    // Check if customer has active bookings
    const activeBookings = await Booking.countDocuments({
      "customer.phone": customer.phone,
      status: { $in: ["draft", "confirmed"] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete customer with ${activeBookings} active booking(s). Please cancel or complete bookings first.`,
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get customer statistics
 */
exports.getCustomerStats = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    // Get booking statistics
    const bookings = await Booking.find({ "customer.phone": customer.phone });

    const stats = {
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter((b) => b.status === "confirmed")
        .length,
      completedBookings: bookings.filter((b) => b.status === "completed")
        .length,
      cancelledBookings: bookings.filter((b) => b.status === "cancelled")
        .length,
      totalSpent: bookings
        .filter((b) => b.status !== "cancelled")
        .reduce((sum, b) => sum + b.pricing.totalAmount, 0),
      averageBookingValue: 0,
      upcomingEvents: bookings.filter(
        (b) =>
          b.status === "confirmed" &&
          new Date(b.eventDetails.eventDate) > new Date(),
      ).length,
    };

    if (stats.totalBookings > 0) {
      stats.averageBookingValue =
        stats.totalSpent / (stats.totalBookings - stats.cancelledBookings);
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Search customers
 */
exports.searchCustomers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Search query must be at least 2 characters",
      });
    }

    const customers = await Customer.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    })
      .limit(10)
      .select("name phone email totalBookings");

    res.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
