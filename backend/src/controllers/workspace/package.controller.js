const Package = require("../../models/Package.model");
const Item = require("../../models/Item.model");
const { calculatePackagePrice } = require("../../services/pricing.service");

/**
 * Get all packages
 */
exports.getAllPackages = async (req, res) => {
  try {
    const { category, isActive } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const packages = await Package.find(filter)
      .populate("items.itemId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get package by ID
 */
exports.getPackageById = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id).populate(
      "items.itemId",
    );

    if (!package) {
      return res.status(404).json({
        success: false,
        error: "Package not found",
      });
    }

    res.json({
      success: true,
      data: package,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Create new package
 */
exports.createPackage = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      items,
      guestCount,
      discountType,
      discountValue,
      notes,
    } = req.body;

    // Validate and enrich items with details
    const enrichedItems = [];
    for (const item of items) {
      const itemDetails = await Item.findById(item.itemId);

      if (!itemDetails) {
        return res.status(404).json({
          success: false,
          error: `Item not found: ${item.itemId}`,
        });
      }

      enrichedItems.push({
        itemId: itemDetails._id,
        itemName: itemDetails.name,
        category: itemDetails.category,
        subcategory: itemDetails.subcategory,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || itemDetails.basePrice,
        priceType: itemDetails.priceType,
      });
    }

    // Calculate pricing if guestCount is provided
    let pricing = {
      subtotal: 0,
      discountType: discountType || "none",
      discountValue: discountValue || 0,
      discountAmount: 0,
      tax: 0,
      taxPercentage: 18,
      totalAmount: 0,
    };

    if (guestCount) {
      const calculation = await calculatePackagePrice({
        items: enrichedItems,
        guestCount,
        discountType,
        discountValue,
      });

      pricing = {
        subtotal: calculation.subtotal,
        discountType: discountType || "none",
        discountValue: discountValue || 0,
        discountAmount: calculation.discountAmount,
        tax: calculation.tax,
        taxPercentage: calculation.taxPercentage,
        totalAmount: calculation.totalAmount,
      };
    }

    const package = await Package.create({
      name,
      description,
      category,
      items: enrichedItems,
      guestCount,
      pricing,
      notes,
    });

    res.status(201).json({
      success: true,
      data: package,
      message: "Package created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update package
 */
exports.updatePackage = async (req, res) => {
  try {
    const package = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("items.itemId");

    if (!package) {
      return res.status(404).json({
        success: false,
        error: "Package not found",
      });
    }

    res.json({
      success: true,
      data: package,
      message: "Package updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete package
 */
exports.deletePackage = async (req, res) => {
  try {
    const package = await Package.findByIdAndDelete(req.params.id);

    if (!package) {
      return res.status(404).json({
        success: false,
        error: "Package not found",
      });
    }

    res.json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Calculate package price
 */
exports.calculatePrice = async (req, res) => {
  try {
    const { items, guestCount, discountType, discountValue } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Items are required",
      });
    }

    if (!guestCount || guestCount < 1) {
      return res.status(400).json({
        success: false,
        error: "Valid guest count is required",
      });
    }

    const calculation = await calculatePackagePrice({
      items,
      guestCount,
      discountType,
      discountValue,
    });

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
