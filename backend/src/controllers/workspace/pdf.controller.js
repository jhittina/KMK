const PDFDocument = require("pdfkit");
const Booking = require("../../models/Booking.model");

/**
 * Generate PDF for a booking
 */
exports.generateBookingPDF = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Create PDF document with better settings
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      bufferPages: true,
      autoFirstPage: true,
    });

    // Generate filename
    const filename = `booking-${booking.bookingNumber}.pdf`;

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    // Pipe PDF to response
    doc.pipe(res);

    // Colors
    const purple = "#8b5cf6";
    const darkPurple = "#7c3aed";
    const lightPurple = "#a78bfa";

    // Helper function to check if we need a new page
    const checkPageBreak = (heightNeeded) => {
      if (doc.y + heightNeeded > doc.page.height - 60) {
        doc.addPage();
        return true;
      }
      return false;
    };

    // Header Background
    doc.rect(0, 0, doc.page.width, 70).fill(purple);

    // Booking Number Badge
    doc
      .roundedRect(doc.page.width / 2 - 100, 85, 200, 35, 5)
      .fillAndStroke("#f3e8ff", purple);

    doc
      .fontSize(9)
      .fillColor(darkPurple)
      .font("Helvetica-Bold")
      .text("BOOKING NUMBER", 0, 91, {
        width: doc.page.width,
        align: "center",
      });

    doc.fontSize(14).fillColor(purple).text(booking.bookingNumber, 0, 104, {
      width: doc.page.width,
      align: "center",
    });

    // Set starting Y position
    let currentY = 140;
    doc.y = currentY;

    // Event Details Section
    doc
      .fontSize(13)
      .fillColor(purple)
      .font("Helvetica-Bold")
      .text("Event Details", 40, currentY);

    doc
      .moveTo(40, currentY + 17)
      .lineTo(200, currentY + 17)
      .lineWidth(2)
      .strokeColor(lightPurple)
      .stroke();

    currentY += 25;
    doc
      .fontSize(9)
      .fillColor("#000")
      .font("Helvetica")
      .text(
        `Event Date: ${new Date(
          booking.eventDetails.eventDate,
        ).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`,
        40,
        currentY,
      );

    currentY += 12;
    doc.text(`Event Type: ${booking.eventDetails.eventType}`, 40, currentY);

    currentY += 12;
    doc.text(`Venue: ${booking.eventDetails.venue}`, 40, currentY);

    currentY += 12;
    doc.text(`Guest Count: ${booking.eventDetails.guestCount}`, 40, currentY);

    currentY += 25;
    doc.y = currentY;

    // Packages Section
    doc
      .fontSize(13)
      .fillColor(purple)
      .font("Helvetica-Bold")
      .text("Packages & Services", 40, currentY);

    doc
      .moveTo(40, currentY + 17)
      .lineTo(doc.page.width - 40, currentY + 17)
      .lineWidth(2)
      .strokeColor(lightPurple)
      .stroke();

    currentY += 25;
    doc.y = currentY;

    // Render each package
    booking.packages.forEach((pkg, pkgIndex) => {
      // Calculate package height
      const itemCount = pkg.items.length;
      const packageHeight = 50 + itemCount * 18 + 15;

      // Check if we need a new page
      checkPageBreak(packageHeight);
      currentY = doc.y;

      // Package header
      doc
        .roundedRect(40, currentY, doc.page.width - 80, 25, 4)
        .fillAndStroke("#f3e8ff", lightPurple);

      doc
        .fontSize(10)
        .fillColor(darkPurple)
        .font("Helvetica-Bold")
        .text(`${pkgIndex + 1}. ${pkg.packageName}`, 48, currentY + 7, {
          width: 300,
          continued: false,
        });

      if (pkg.packageCategory) {
        doc
          .fontSize(8)
          .fillColor(purple)
          .font("Helvetica")
          .text(
            `Category: ${pkg.packageCategory}`,
            doc.page.width - 180,
            currentY + 9,
          );
      }

      currentY += 30;

      // Table header
      const tableLeft = 50;
      const tableWidth = doc.page.width - 100;
      const col1Width = tableWidth * 0.45;
      const col2Width = tableWidth * 0.35;
      const col3Width = tableWidth * 0.2;

      doc
        .rect(tableLeft, currentY, tableWidth, 20)
        .fillAndStroke("#f8f4ff", purple);

      doc
        .fontSize(9)
        .fillColor(darkPurple)
        .font("Helvetica-Bold")
        .text("Item Name", tableLeft + 5, currentY + 6, {
          width: col1Width - 5,
        })
        .text("Category", tableLeft + col1Width, currentY + 6, {
          width: col2Width,
        })
        .text("Qty", tableLeft + col1Width + col2Width, currentY + 6, {
          width: col3Width,
        });

      currentY += 20;

      // Table rows
      pkg.items.forEach((item, idx) => {
        if (idx % 2 === 0) {
          doc
            .rect(tableLeft, currentY, tableWidth, 18)
            .fillAndStroke("#faf8ff", "#e9d5ff");
        }

        doc
          .fontSize(8)
          .fillColor("#000")
          .font("Helvetica")
          .text(item.itemName, tableLeft + 5, currentY + 5, {
            width: col1Width - 10,
            ellipsis: true,
          })
          .text(item.category || "-", tableLeft + col1Width, currentY + 5, {
            width: col2Width - 5,
            ellipsis: true,
          })
          .text(
            item.quantity.toString(),
            tableLeft + col1Width + col2Width,
            currentY + 5,
            {
              width: col3Width,
            },
          );

        currentY += 18;
      });

      currentY += 15;
      doc.y = currentY;
    });

    // Price Summary Section
    checkPageBreak(120);
    currentY = doc.y + 10;

    doc
      .fontSize(13)
      .fillColor(purple)
      .font("Helvetica-Bold")
      .text("Price Summary", 40, currentY);

    doc
      .moveTo(40, currentY + 17)
      .lineTo(200, currentY + 17)
      .lineWidth(2)
      .strokeColor(lightPurple)
      .stroke();

    currentY += 28;

    // Subtotal
    doc
      .fontSize(9)
      .fillColor("#000")
      .font("Helvetica")
      .text("Subtotal:", 40, currentY)
      .text(
        `₹${booking.pricing.subtotal.toLocaleString("en-IN")}`,
        doc.page.width - 150,
        currentY,
        { width: 110, align: "right" },
      );

    currentY += 14;

    // Discount
    if (booking.pricing.discountAmount > 0) {
      const discountText =
        booking.pricing.discountType === "percentage"
          ? `${booking.pricing.discountValue}%`
          : `₹${booking.pricing.discountValue}`;

      doc
        .text(`Discount (${discountText}):`, 40, currentY)
        .fillColor("#059669")
        .text(
          `-₹${booking.pricing.discountAmount.toLocaleString("en-IN")}`,
          doc.page.width - 150,
          currentY,
          { width: 110, align: "right" },
        )
        .fillColor("#000");

      currentY += 14;
    }

    // Tax
    doc
      .text(`Tax (${booking.pricing.taxPercentage}%):`, 40, currentY)
      .text(
        `₹${booking.pricing.tax.toLocaleString("en-IN")}`,
        doc.page.width - 150,
        currentY,
        { width: 110, align: "right" },
      );

    currentY += 18;

    // Divider
    doc
      .moveTo(40, currentY)
      .lineTo(doc.page.width - 40, currentY)
      .lineWidth(1)
      .strokeColor(lightPurple)
      .stroke();

    currentY += 8;

    // Total
    doc
      .fontSize(11)
      .fillColor(purple)
      .font("Helvetica-Bold")
      .text("Total:", 40, currentY)
      .text(
        `₹${booking.pricing.totalAmount.toLocaleString("en-IN")}`,
        doc.page.width - 150,
        currentY,
        { width: 110, align: "right" },
      );

    currentY += 25;

    // Status Badge
    const statusColors = {
      draft: { bg: "#fef3c7", text: "#92400e" },
      confirmed: { bg: "#dbeafe", text: "#1e40af" },
      completed: { bg: "#d1fae5", text: "#065f46" },
      cancelled: { bg: "#fee2e2", text: "#991b1b" },
    };

    const statusColor = statusColors[booking.status] || statusColors.draft;

    doc
      .roundedRect(40, currentY, 110, 25, 4)
      .fillAndStroke(statusColor.bg, statusColor.text);

    doc
      .fontSize(9)
      .fillColor(statusColor.text)
      .font("Helvetica-Bold")
      .text(`Status: ${booking.status.toUpperCase()}`, 48, currentY + 8);

    currentY += 40;

    // Footer
    doc.rect(0, currentY, doc.page.width, 45).fill("#f8f4ff");

    doc
      .fontSize(10)
      .fillColor(purple)
      .font("Helvetica-Bold")
      .text("Thank you!", 0, currentY + 10, {
        align: "center",
        width: doc.page.width,
      });

    doc
      .fontSize(7)
      .fillColor("#666")
      .font("Helvetica")
      .text(
        `Generated on: ${new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })} at ${new Date().toLocaleTimeString("en-IN")}`,
        0,
        currentY + 26,
        {
          align: "center",
          width: doc.page.width,
        },
      );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
