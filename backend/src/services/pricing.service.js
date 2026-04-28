const Item = require("../models/Item.model");

/**
 * Calculate package pricing based on items and guest count
 */
const calculatePackagePrice = async (data) => {
  const {
    items,
    guestCount,
    discountType = "none",
    discountValue = 0,
    taxPercentage: customTaxPercentage,
  } = data;

  let subtotal = 0;
  const breakdown = [];

  // Calculate each item's cost
  for (const item of items) {
    const itemDetails = await Item.findById(item.itemId);

    if (!itemDetails) {
      throw new Error(`Item not found: ${item.itemId}`);
    }

    const unitPrice = item.unitPrice || itemDetails.basePrice;
    const quantity = item.quantity || 1;
    let totalPrice = 0;

    switch (itemDetails.priceType) {
      case "per_person":
        totalPrice = unitPrice * guestCount * quantity;
        break;
      case "flat_rate":
        totalPrice = unitPrice * quantity;
        break;
      case "per_hour":
        totalPrice = unitPrice * quantity; // quantity represents hours
        break;
      default:
        totalPrice = unitPrice * quantity;
    }

    subtotal += totalPrice;

    breakdown.push({
      itemId: itemDetails._id,
      itemName: itemDetails.name,
      category: itemDetails.category,
      subcategory: itemDetails.subcategory,
      priceType: itemDetails.priceType,
      unitPrice,
      quantity:
        itemDetails.priceType === "per_person"
          ? guestCount * quantity
          : quantity,
      totalPrice,
    });
  }

  // Calculate discount
  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = (subtotal * discountValue) / 100;
  } else if (discountType === "flat") {
    discountAmount = discountValue;
  }

  // Calculate tax (GST) - use custom tax percentage if provided, otherwise use default
  const taxPercentage =
    customTaxPercentage !== undefined && customTaxPercentage !== null
      ? parseFloat(customTaxPercentage)
      : parseFloat(process.env.GST_PERCENTAGE) || 18;
  const taxableAmount = subtotal - discountAmount;
  const tax = (taxableAmount * taxPercentage) / 100;

  // Calculate total
  const totalAmount = subtotal - discountAmount + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    taxPercentage,
    totalAmount: Math.round(totalAmount * 100) / 100,
    breakdown,
  };
};

/**
 * Calculate booking price from package or items
 */
const calculateBookingPrice = async (data) => {
  const {
    packageId,
    packageIds,
    items,
    guestCount,
    discountType,
    discountValue,
    taxPercentage,
  } = data;

  let itemsToCalculate = items;

  // Support both single packageId and multiple packageIds
  const packageIdsToProcess = packageIds || (packageId ? [packageId] : []);

  // If packageIds are provided, fetch items from all packages
  if (packageIdsToProcess.length > 0) {
    const Package = require("../models/Package.model");
    const allItems = [];

    for (const pkgId of packageIdsToProcess) {
      const pkg = await Package.findById(pkgId).populate("items.itemId");

      if (!pkg) {
        throw new Error(`Package not found: ${pkgId}`);
      }

      const packageItems = pkg.items.map((item) => ({
        itemId: item.itemId._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      allItems.push(...packageItems);
    }

    itemsToCalculate = allItems;
  }

  return await calculatePackagePrice({
    items: itemsToCalculate,
    guestCount,
    discountType,
    discountValue,
    taxPercentage,
  });
};

module.exports = {
  calculatePackagePrice,
  calculateBookingPrice,
};
