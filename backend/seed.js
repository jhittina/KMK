const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("./src/models/Category.model");
const Item = require("./src/models/Item.model");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Category.deleteMany({});
    await Item.deleteMany({});

    // Create Categories
    console.log("📁 Creating categories...");
    const categories = await Category.insertMany([
      {
        name: "Food",
        description: "Food and catering items",
        subcategories: [
          { name: "Sabji", description: "Vegetable dishes" },
          { name: "Roti", description: "Bread items" },
          { name: "Rice", description: "Rice dishes" },
          { name: "Dessert", description: "Sweet dishes" },
        ],
      },
      {
        name: "Decoration",
        description: "Decoration and setup items",
        subcategories: [
          { name: "Stage", description: "Stage decoration" },
          { name: "Entrance", description: "Entrance decoration" },
          { name: "Hall", description: "Hall decoration" },
        ],
      },
      {
        name: "Photography",
        description: "Photography and videography services",
        subcategories: [
          { name: "Traditional", description: "Traditional photography" },
          { name: "Candid", description: "Candid photography" },
          { name: "Video", description: "Videography" },
        ],
      },
      {
        name: "Entertainment",
        description: "Entertainment and music services",
        subcategories: [
          { name: "DJ", description: "DJ services" },
          { name: "Live Band", description: "Live music band" },
          { name: "Anchor", description: "Event anchor/host" },
        ],
      },
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create Items
    console.log("📦 Creating items...");
    const items = await Item.insertMany([
      // Food - Sabji
      {
        name: "Kadhai Paneer",
        category: "Food",
        subcategory: "Sabji",
        description: "Spicy cottage cheese curry with bell peppers",
        basePrice: 200,
        priceType: "per_person",
        unit: "plate",
        specifications: [
          { key: "Spice Level", value: "Medium" },
          { key: "Serving Size", value: "200g" },
        ],
      },
      {
        name: "Kolhapuri Paneer",
        category: "Food",
        subcategory: "Sabji",
        description: "Rich and spicy Kolhapuri-style paneer curry",
        basePrice: 220,
        priceType: "per_person",
        unit: "plate",
      },
      {
        name: "Paneer Butter Masala",
        category: "Food",
        subcategory: "Sabji",
        description: "Creamy tomato-based paneer curry",
        basePrice: 210,
        priceType: "per_person",
        unit: "plate",
      },
      {
        name: "Mixed Veg Curry",
        category: "Food",
        subcategory: "Sabji",
        description: "Assorted vegetables in curry",
        basePrice: 150,
        priceType: "per_person",
        unit: "plate",
      },

      // Food - Roti
      {
        name: "Butter Naan",
        category: "Food",
        subcategory: "Roti",
        description: "Soft butter naan bread",
        basePrice: 30,
        priceType: "per_person",
        unit: "piece",
      },
      {
        name: "Tandoori Roti",
        category: "Food",
        subcategory: "Roti",
        description: "Traditional tandoor-baked roti",
        basePrice: 20,
        priceType: "per_person",
        unit: "piece",
      },
      {
        name: "Garlic Naan",
        category: "Food",
        subcategory: "Roti",
        description: "Naan topped with garlic",
        basePrice: 40,
        priceType: "per_person",
        unit: "piece",
      },

      // Food - Rice
      {
        name: "Jeera Rice",
        category: "Food",
        subcategory: "Rice",
        description: "Cumin flavored basmati rice",
        basePrice: 100,
        priceType: "per_person",
        unit: "plate",
      },
      {
        name: "Veg Biryani",
        category: "Food",
        subcategory: "Rice",
        description: "Aromatic vegetable biryani",
        basePrice: 180,
        priceType: "per_person",
        unit: "plate",
      },
      {
        name: "Pulao",
        category: "Food",
        subcategory: "Rice",
        description: "Mildly spiced vegetable pulao",
        basePrice: 120,
        priceType: "per_person",
        unit: "plate",
      },

      // Food - Dessert
      {
        name: "Gulab Jamun",
        category: "Food",
        subcategory: "Dessert",
        description: "Sweet milk balls in sugar syrup",
        basePrice: 50,
        priceType: "per_person",
        unit: "piece",
      },
      {
        name: "Rasmalai",
        category: "Food",
        subcategory: "Dessert",
        description: "Cottage cheese balls in sweet cream",
        basePrice: 60,
        priceType: "per_person",
        unit: "piece",
      },
      {
        name: "Ice Cream",
        category: "Food",
        subcategory: "Dessert",
        description: "Assorted ice cream flavors",
        basePrice: 40,
        priceType: "per_person",
        unit: "scoop",
      },

      // Decoration
      {
        name: "Premium Stage Decoration",
        category: "Decoration",
        subcategory: "Stage",
        description: "Luxury stage setup with flowers and lighting",
        basePrice: 50000,
        priceType: "flat_rate",
        unit: "setup",
      },
      {
        name: "Standard Stage Decoration",
        category: "Decoration",
        subcategory: "Stage",
        description: "Standard stage decoration",
        basePrice: 25000,
        priceType: "flat_rate",
        unit: "setup",
      },
      {
        name: "Entrance Arch",
        category: "Decoration",
        subcategory: "Entrance",
        description: "Decorative entrance arch with flowers",
        basePrice: 15000,
        priceType: "flat_rate",
        unit: "setup",
      },
      {
        name: "Hall Ceiling Decoration",
        category: "Decoration",
        subcategory: "Hall",
        description: "Ceiling draping and lighting",
        basePrice: 30000,
        priceType: "flat_rate",
        unit: "setup",
      },

      // Photography
      {
        name: "Traditional Photography",
        category: "Photography",
        subcategory: "Traditional",
        description: "Traditional wedding photography - 8 hours",
        basePrice: 40000,
        priceType: "flat_rate",
        unit: "package",
      },
      {
        name: "Candid Photography",
        category: "Photography",
        subcategory: "Candid",
        description: "Candid photography with 2 photographers",
        basePrice: 60000,
        priceType: "flat_rate",
        unit: "package",
      },
      {
        name: "Videography",
        category: "Photography",
        subcategory: "Video",
        description: "Full HD video coverage with editing",
        basePrice: 50000,
        priceType: "flat_rate",
        unit: "package",
      },

      // Entertainment
      {
        name: "Professional DJ",
        category: "Entertainment",
        subcategory: "DJ",
        description: "DJ services with sound system",
        basePrice: 25000,
        priceType: "flat_rate",
        unit: "event",
      },
      {
        name: "Live Band",
        category: "Entertainment",
        subcategory: "Live Band",
        description: "5-piece live music band",
        basePrice: 80000,
        priceType: "flat_rate",
        unit: "event",
      },
      {
        name: "Event Anchor",
        category: "Entertainment",
        subcategory: "Anchor",
        description: "Professional event host/anchor",
        basePrice: 15000,
        priceType: "flat_rate",
        unit: "event",
      },
    ]);

    console.log(`✅ Created ${items.length} items`);

    console.log("\n🎉 Seed data created successfully!");
    console.log("\nSummary:");
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Items: ${items.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

// Run seed
seedData();
