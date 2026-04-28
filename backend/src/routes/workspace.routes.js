const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");

const packageController = require("../controllers/workspace/package.controller");
const bookingController = require("../controllers/workspace/booking.controller");
const customerController = require("../controllers/workspace/customer.controller");
const pdfController = require("../controllers/workspace/pdf.controller");

// ============ Package Routes ============
// All authenticated users can access packages
router.get("/packages", protect, packageController.getAllPackages);
router.get("/packages/:id", protect, packageController.getPackageById);
router.post("/packages", protect, packageController.createPackage);
router.put("/packages/:id", protect, packageController.updatePackage);
router.delete("/packages/:id", protect, packageController.deletePackage);
router.post("/packages/calculate", protect, packageController.calculatePrice);

// ============ Booking Routes ============
// All authenticated users can access bookings
router.get("/bookings", protect, bookingController.getAllBookings);
router.get("/bookings/:id", protect, bookingController.getBookingById);
router.get(
  "/bookings/number/:bookingNumber",
  protect,
  bookingController.getBookingByNumber,
);
router.post("/bookings", protect, bookingController.createBooking);
router.put("/bookings/:id", protect, bookingController.updateBooking);
router.put(
  "/bookings/:id/status",
  protect,
  bookingController.updateBookingStatus,
);
router.put(
  "/bookings/:id/record-payment",
  protect,
  bookingController.recordBookingPayment,
);
router.delete("/bookings/:id", protect, bookingController.deleteBooking);
router.post("/bookings/calculate", protect, bookingController.calculatePrice);
router.get("/bookings/:id/pdf", protect, pdfController.generateBookingPDF);

// ============ Customer Routes ============
// All authenticated users can access customers
router.get("/customers", protect, customerController.getAllCustomers);
router.get("/customers/search", protect, customerController.searchCustomers);
router.get(
  "/customers/phone/:phone",
  protect,
  customerController.getCustomerByPhone,
);
router.get("/customers/:id", protect, customerController.getCustomerById);
router.get(
  "/customers/:id/stats",
  protect,
  customerController.getCustomerStats,
);
router.post("/customers", protect, customerController.createCustomer);
router.put("/customers/:id", protect, customerController.updateCustomer);
router.delete("/customers/:id", protect, customerController.deleteCustomer);

module.exports = router;
