const Item = require("../../models/Item.model");

/**
 * Get all items with filters
 */
exports.getAllItems = async (req, res) => {
  try {
    const { category, subcategory, isActive, search } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$text = { $search: search };
    }

    const items = await Item.find(filter).sort({
      category: 1,
      subcategory: 1,
      displayOrder: 1,
      name: 1,
    });

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get item by ID
 */
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found",
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Create new item
 */
exports.createItem = async (req, res) => {
  try {
    const item = await Item.create(req.body);

    res.status(201).json({
      success: true,
      data: item,
      message: "Item created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update item
 */
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found",
      });
    }

    res.json({
      success: true,
      data: item,
      message: "Item updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete item
 */
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found",
      });
    }

    res.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get items by category
 */
exports.getItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { subcategory, isActive } = req.query;

    const filter = { category };
    if (subcategory) filter.subcategory = subcategory;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const items = await Item.find(filter).sort({
      subcategory: 1,
      displayOrder: 1,
      name: 1,
    });

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all unique categories from items
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Item.distinct("category");

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
