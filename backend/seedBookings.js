require("dotenv").config();
const mongoose = require("mongoose");
const Customer = require("./src/models/Customer.model");
const Package = require("./src/models/Package.model");
const Booking = require("./src/models/Booking.model");
const Item = require("./src/models/Item.model");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Helper function to generate random date in a specific month/year
const randomDate = (year, month) => {
  const day = Math.floor(Math.random() * 28) + 1; // 1-28 to avoid month issues
  return new Date(year, month, day);
};

// Helper function to get random items from array
const getRandomItems = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const seedBookings = async () => {
  try {
    await connectDB();

    console.log("🗑️  Clearing existing booking data...");
    await Customer.deleteMany({});
    await Package.deleteMany({});
    await Booking.deleteMany({});

    // Get all items to create packages
    const allItems = await Item.find({});
    if (allItems.length === 0) {
      console.error("❌ No items found. Please run 'npm run seed' first!");
      process.exit(1);
    }

    console.log(`📦 Found ${allItems.length} items`);

    // Create Customers
    console.log("\n👥 Creating customers...");
    const customers = await Customer.insertMany([
      {
        name: "Rajesh Kumar",
        email: "rajesh@example.com",
        phone: "9876543210",
        address: "123 MG Road, Mumbai",
        city: "Mumbai",
        state: "Maharashtra",
      },
      {
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "9876543211",
        address: "456 Park Street, Delhi",
        city: "Delhi",
        state: "Delhi",
      },
      {
        name: "Amit Patel",
        email: "amit@example.com",
        phone: "9876543212",
        address: "789 Ring Road, Ahmedabad",
        city: "Ahmedabad",
        state: "Gujarat",
      },
      {
        name: "Sneha Desai",
        email: "sneha@example.com",
        phone: "9876543213",
        address: "321 FC Road, Pune",
        city: "Pune",
        state: "Maharashtra",
      },
      {
        name: "Vikram Singh",
        email: "vikram@example.com",
        phone: "9876543214",
        address: "654 Mall Road, Jaipur",
        city: "Jaipur",
        state: "Rajasthan",
      },
      {
        name: "Anita Reddy",
        email: "anita@example.com",
        phone: "9876543215",
        address: "987 Tank Bund, Hyderabad",
        city: "Hyderabad",
        state: "Telangana",
      },
      {
        name: "Karthik Rao",
        email: "karthik@example.com",
        phone: "9876543216",
        address: "147 Brigade Road, Bangalore",
        city: "Bangalore",
        state: "Karnataka",
      },
      {
        name: "Meera Iyer",
        email: "meera@example.com",
        phone: "9876543217",
        address: "258 Anna Salai, Chennai",
        city: "Chennai",
        state: "Tamil Nadu",
      },
      {
        name: "Suresh Gupta",
        email: "suresh@example.com",
        phone: "9876543218",
        address: "369 Park Road, Kolkata",
        city: "Kolkata",
        state: "West Bengal",
      },
      {
        name: "Deepa Nair",
        email: "deepa@example.com",
        phone: "9876543219",
        address: "741 Marine Drive, Kochi",
        city: "Kochi",
        state: "Kerala",
      },
    ]);

    console.log(`✅ Created ${customers.length} customers`);

    // Create Packages
    console.log("\n📦 Creating packages...");
    const packageTemplates = [
      {
        name: "Premium Wedding Package",
        description: "Complete premium wedding package with all amenities",
        category: "Wedding",
        guestCount: 500,
        itemTypes: ["Food", "Decoration", "Photography", "Entertainment"],
      },
      {
        name: "Standard Wedding Package",
        description: "Standard wedding package with essential services",
        category: "Wedding",
        guestCount: 300,
        itemTypes: ["Food", "Decoration", "Photography"],
      },
      {
        name: "Budget Wedding Package",
        description: "Budget-friendly wedding package",
        category: "Wedding",
        guestCount: 150,
        itemTypes: ["Food", "Decoration"],
      },
      {
        name: "Grand Reception Package",
        description: "Luxurious reception package",
        category: "Reception",
        guestCount: 800,
        itemTypes: ["Food", "Decoration", "Entertainment"],
      },
      {
        name: "Birthday Party Package",
        description: "Fun birthday celebration package",
        category: "Birthday",
        guestCount: 100,
        itemTypes: ["Food", "Decoration", "Entertainment"],
      },
    ];

    const packages = [];
    for (const template of packageTemplates) {
      // Get items for this package based on categories
      const packageItems = [];
      for (const itemType of template.itemTypes) {
        const itemsOfType = allItems.filter(
          (item) => item.category === itemType,
        );
        const selectedItems = getRandomItems(
          itemsOfType,
          Math.min(2, itemsOfType.length),
        );

        // Format items according to Package schema
        for (const item of selectedItems) {
          packageItems.push({
            itemId: item._id,
            itemName: item.name,
            category: item.category,
            subcategory: item.subcategory,
            quantity: 1,
            unitPrice: item.basePrice,
            priceType: item.priceType,
          });
        }
      }

      // Calculate package pricing
      let subtotal = 0;
      for (const item of packageItems) {
        if (item.priceType === "per_person") {
          subtotal += item.unitPrice * template.guestCount * item.quantity;
        } else {
          subtotal += item.unitPrice * item.quantity;
        }
      }

      const taxPercentage = 18;
      const taxAmount = (subtotal * taxPercentage) / 100;
      const totalAmount = subtotal + taxAmount;

      const pkg = await Package.create({
        name: template.name,
        description: template.description,
        category: template.category,
        items: packageItems,
        guestCount: template.guestCount,
        pricing: {
          subtotal,
          taxPercentage,
          tax: taxAmount,
          totalAmount,
          discountType: "none",
          discountValue: 0,
          discountAmount: 0,
        },
        isActive: true,
      });
      packages.push(pkg);
    }

    console.log(`✅ Created ${packages.length} packages`);

    // Create Bookings with varied dates
    console.log("\n📅 Creating bookings...");
    const eventTypes = [
      "Wedding",
      "Reception",
      "Engagement",
      "Pre-Wedding",
      "Other",
    ];
    const statuses = ["draft", "confirmed", "completed", "cancelled"];
    const bookings = [];

    let bookingCounter = 1;

    // Define booking scenarios for realistic data
    const bookingScenarios = [
      // 2024 Bookings (Last Year) - Mostly completed
      { year: 2024, month: 0, count: 3, statusWeights: [0, 0.1, 0.8, 0.1] }, // Jan
      { year: 2024, month: 1, count: 2, statusWeights: [0, 0.1, 0.8, 0.1] }, // Feb
      { year: 2024, month: 2, count: 4, statusWeights: [0, 0.1, 0.8, 0.1] }, // Mar
      { year: 2024, month: 3, count: 5, statusWeights: [0, 0.1, 0.8, 0.1] }, // Apr
      { year: 2024, month: 4, count: 6, statusWeights: [0, 0.1, 0.8, 0.1] }, // May
      { year: 2024, month: 5, count: 4, statusWeights: [0, 0.1, 0.8, 0.1] }, // Jun
      { year: 2024, month: 6, count: 3, statusWeights: [0, 0.1, 0.8, 0.1] }, // Jul
      { year: 2024, month: 7, count: 3, statusWeights: [0, 0.1, 0.8, 0.1] }, // Aug
      { year: 2024, month: 8, count: 4, statusWeights: [0, 0.1, 0.8, 0.1] }, // Sep
      { year: 2024, month: 9, count: 5, statusWeights: [0, 0.1, 0.8, 0.1] }, // Oct
      { year: 2024, month: 10, count: 7, statusWeights: [0, 0.1, 0.8, 0.1] }, // Nov
      { year: 2024, month: 11, count: 8, statusWeights: [0, 0.1, 0.8, 0.1] }, // Dec

      // 2025 Bookings (This Year) - Mix of all statuses
      { year: 2025, month: 0, count: 5, statusWeights: [0.1, 0.2, 0.6, 0.1] }, // Jan
      { year: 2025, month: 1, count: 4, statusWeights: [0.1, 0.2, 0.6, 0.1] }, // Feb
      { year: 2025, month: 2, count: 6, statusWeights: [0.1, 0.3, 0.5, 0.1] }, // Mar
      { year: 2025, month: 3, count: 7, statusWeights: [0.15, 0.35, 0.4, 0.1] }, // Apr
      { year: 2025, month: 4, count: 8, statusWeights: [0.15, 0.35, 0.4, 0.1] }, // May
      { year: 2025, month: 5, count: 6, statusWeights: [0.15, 0.4, 0.35, 0.1] }, // Jun
      { year: 2025, month: 6, count: 5, statusWeights: [0.2, 0.4, 0.3, 0.1] }, // Jul
      { year: 2025, month: 7, count: 5, statusWeights: [0.2, 0.4, 0.3, 0.1] }, // Aug
      { year: 2025, month: 8, count: 6, statusWeights: [0.2, 0.45, 0.25, 0.1] }, // Sep
      { year: 2025, month: 9, count: 7, statusWeights: [0.2, 0.5, 0.2, 0.1] }, // Oct
      {
        year: 2025,
        month: 10,
        count: 9,
        statusWeights: [0.25, 0.5, 0.15, 0.1],
      }, // Nov
      {
        year: 2025,
        month: 11,
        count: 10,
        statusWeights: [0.25, 0.5, 0.15, 0.1],
      }, // Dec

      // 2026 Bookings (Current/Future) - Mostly drafts and confirmed
      { year: 2026, month: 0, count: 4, statusWeights: [0.3, 0.6, 0.1, 0] }, // Jan
      { year: 2026, month: 1, count: 4, statusWeights: [0.3, 0.6, 0.1, 0] }, // Feb
      { year: 2026, month: 2, count: 5, statusWeights: [0.3, 0.65, 0.05, 0] }, // Mar
      { year: 2026, month: 3, count: 6, statusWeights: [0.35, 0.6, 0.05, 0] }, // Apr (current month)
      { year: 2026, month: 4, count: 7, statusWeights: [0.4, 0.6, 0, 0] }, // May
      { year: 2026, month: 5, count: 6, statusWeights: [0.5, 0.5, 0, 0] }, // Jun
      { year: 2026, month: 6, count: 5, statusWeights: [0.5, 0.5, 0, 0] }, // Jul
      { year: 2026, month: 7, count: 6, statusWeights: [0.5, 0.5, 0, 0] }, // Aug
      { year: 2026, month: 8, count: 7, statusWeights: [0.5, 0.5, 0, 0] }, // Sep
      { year: 2026, month: 9, count: 8, statusWeights: [0.5, 0.5, 0, 0] }, // Oct
      { year: 2026, month: 10, count: 10, statusWeights: [0.6, 0.4, 0, 0] }, // Nov
      { year: 2026, month: 11, count: 12, statusWeights: [0.6, 0.4, 0, 0] }, // Dec
    ];

    for (const scenario of bookingScenarios) {
      for (let i = 0; i < scenario.count; i++) {
        const customer =
          customers[Math.floor(Math.random() * customers.length)];
        const pkg = packages[Math.floor(Math.random() * packages.length)];
        const eventType =
          eventTypes[Math.floor(Math.random() * eventTypes.length)];

        // Determine status based on weights
        const rand = Math.random();
        let status;
        let cumulative = 0;
        for (let j = 0; j < statuses.length; j++) {
          cumulative += scenario.statusWeights[j];
          if (rand < cumulative) {
            status = statuses[j];
            break;
          }
        }

        const eventDate = randomDate(scenario.year, scenario.month);
        const guestCount =
          pkg.guestCount + Math.floor(Math.random() * 100) - 50; // +/- 50 guests

        // Format packages with items
        const formattedPackages = [
          {
            packageId: pkg._id,
            packageName: pkg.name,
            packageCategory: pkg.category,
            items: pkg.items.map((item) => ({
              itemId: item.itemId,
              itemName: item.itemName,
              category: item.category,
              subcategory: item.subcategory,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              priceType: item.priceType,
              totalPrice:
                item.priceType === "per_person"
                  ? item.unitPrice * guestCount * item.quantity
                  : item.unitPrice * item.quantity,
            })),
          },
        ];

        // Calculate pricing based on package
        let subtotal = 0;
        for (const pkgItem of formattedPackages[0].items) {
          subtotal += pkgItem.totalPrice;
        }

        const taxPercentage = 18;
        const taxAmount = (subtotal * taxPercentage) / 100;
        const totalAmount = subtotal + taxAmount;

        const booking = await Booking.create({
          bookingNumber: `KRL${String(bookingCounter++).padStart(8, "0")}`,
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },
          packages: formattedPackages,
          eventDetails: {
            eventType,
            eventDate,
            guestCount,
            venue: `Hall ${Math.floor(Math.random() * 3) + 1}`,
            additionalInfo: "",
          },
          pricing: {
            subtotal,
            taxPercentage,
            tax: taxAmount,
            discountType: "none",
            discountValue: 0,
            discountAmount: 0,
            totalAmount: Math.round(totalAmount),
          },
          status,
          notes: "",
          createdAt: new Date(scenario.year, scenario.month, 1),
          updatedAt: new Date(scenario.year, scenario.month, 5),
        });

        bookings.push(booking);
      }
    }

    console.log(`✅ Created ${bookings.length} bookings`);

    console.log("\n📊 Booking Statistics:");
    const statsCounts = {
      draft: bookings.filter((b) => b.status === "draft").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
    console.log(`  - Draft: ${statsCounts.draft}`);
    console.log(`  - Confirmed: ${statsCounts.confirmed}`);
    console.log(`  - Completed: ${statsCounts.completed}`);
    console.log(`  - Cancelled: ${statsCounts.cancelled}`);

    const totalRevenue = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + b.pricing.totalAmount, 0);
    console.log(
      `\n💰 Total Revenue (Completed): ₹${totalRevenue.toLocaleString("en-IN")}`,
    );

    console.log("\n🎉 Booking seed data created successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding bookings:", error);
    process.exit(1);
  }
};

// Run seed
seedBookings();
