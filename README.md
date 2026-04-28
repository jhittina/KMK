# Karalaya Wedding Package Management System

Complete full-stack application for managing wedding packages, bookings, and customers.

## 🚀 Quick Start Guide

### Prerequisites

- Node.js 16+
- MongoDB running on localhost:27017

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies (already done)
npm install

# 3. Start MongoDB (if not running)
brew services start mongodb-community  # macOS
# or
sudo systemctl start mongod  # Linux

# 4. Start the backend server
npm run dev
```

Backend will run on: `http://localhost:5000`

### Frontend Setup

```bash
# 1. Open a new terminal and navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start the React app
npm start
```

Frontend will open at: `http://localhost:3000`

## 📊 Complete Project Structure

```
Karalaya/
├── backend/                    # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── models/            # 5 Mongoose models
│   │   ├── controllers/       # API logic (Config + Workspace)
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic (pricing)
│   │   └── middleware/        # Error handling & validation
│   ├── server.js              # Entry point
│   ├── seed.js                # Sample data seeder
│   └── README.md              # Backend docs
│
└── frontend/                   # React + Material UI + React Query
    ├── src/
    │   ├── components/        # Reusable components
    │   ├── pages/             # 10 main pages
    │   ├── hooks/             # React Query hooks
    │   ├── services/          # API services
    │   └── utils/             # Helper functions
    ├── public/
    └── README.md              # Frontend docs
```

## 📁 Files Created

### Backend (17 files)

- **5 Models**: Category, Item, Package, Booking, Customer
- **5 Controllers**: Category, Item, Package, Booking, Customer
- **2 Routes**: Config, Workspace
- **1 Service**: Pricing calculation
- **3 Middleware**: Async handler, Error handler, Validation
- **1 Config**: Database connection

### Frontend (21 files)

- **10 Pages**: Dashboard, Categories, Items, Packages, PackageBuilder, Bookings, CreateBooking, BookingDetails, Customers, CustomerDetails
- **4 Components**: Layout, Loading, ErrorMessage
- **3 Services**: API, ConfigService, WorkspaceService
- **2 Hooks**: useConfig, useWorkspace
- **1 Utils**: Helpers
- **1 App**: Main application with routing

## 🎯 Features Implemented

### Config Profile (Master Data Management)

✅ Categories with subcategories  
✅ Items catalog with pricing (per_person, flat_rate, per_hour)  
✅ CRUD operations with real-time updates

### Workspace Profile (Business Operations)

✅ Package builder with item selection  
✅ Real-time price calculation  
✅ Booking management with auto-generated booking numbers  
✅ Customer tracking with statistics  
✅ Booking status management

### Technical Features

✅ React Query for server state management  
✅ Material UI with custom theme  
✅ Tailwind CSS for additional styling  
✅ Responsive design (mobile & desktop)  
✅ Error handling with retry  
✅ Loading states  
✅ Form validation  
✅ Search and filtering  
✅ Auto-calculation of pricing with discounts and tax

## 🔌 API Endpoints

### Config Profile

- `GET/POST /api/config/categories` - Manage categories
- `GET/POST /api/config/items` - Manage items

### Workspace Profile

- `GET/POST /api/workspace/packages` - Manage packages
- `POST /api/workspace/packages/calculate` - Calculate price
- `GET/POST /api/workspace/bookings` - Manage bookings
- `PUT /api/workspace/bookings/:id/status` - Update status
- `GET/POST /api/workspace/customers` - Manage customers
- `GET /api/workspace/customers/:id/stats` - Customer statistics

## 📝 Usage Workflow

### 1. **Setup Master Data**

```
Config → Categories → Add "Food", "Decoration", etc.
Config → Items → Add "Kadhai Paneer (₹200/person)", "Stage Decoration (₹50,000 flat)", etc.
```

### 2. **Create Package**

```
Workspace → Packages → Create Package
- Add items from catalog
- Set guest count (e.g., 150)
- Apply discount (optional)
- Save package
```

### 3. **Create Booking**

```
Workspace → Bookings → Create Booking
- Enter customer details (name, phone, email)
- Fill event details (date, type, venue, guest count)
- Select package
- Review calculated price (auto-calculated with tax)
- Submit → Auto-generates booking number (KRL2604XXXX)
```

### 4. **Manage Customers**

```
Workspace → Customers
- Automatically created from bookings
- View booking history
- See statistics (total bookings, total spent, average value)
```

## 💰 Price Calculation Logic

```
For each item:
  - per_person: price × guest count × quantity
  - flat_rate: price × quantity
  - per_hour: price × hours (quantity = hours)

Subtotal = Sum of all items
Discount = Subtotal × (discount% / 100) OR flat amount
Tax = (Subtotal - Discount) × 18% (GST)
Total = Subtotal - Discount + Tax
```

## 🎨 UI Highlights

- **Modern Design**: Material UI components with custom theme
- **Color Scheme**: Sky Blue primary, Purple secondary
- **Responsive**: Works on mobile, tablet, and desktop
- **Navigation**: Sidebar with sections for Config and Workspace
- **Real-time Updates**: React Query auto-refetches data
- **User Feedback**: Loading spinners, success messages, error handling

## 📱 Screenshots Flow

1. **Dashboard** - Overview with statistics
2. **Categories** - Grid view of categories with subcategories
3. **Items** - Table view with category chips and price types
4. **Package Builder** - Drag-and-drop interface with price summary
5. **Bookings** - Table with filters and status chips
6. **Booking Details** - Detailed view with pricing breakdown
7. **Customers** - Search-enabled table with stats
8. **Customer Details** - Profile with booking history and insights

## 🔧 Testing the System

### 1. Test Data Already Seeded

The backend has sample data:

- 4 categories (Food, Decoration, Photography, Entertainment)
- 23 items across all categories
- Various price types (per_person, flat_rate)

### 2. Create Your First Booking

1. Start both backend and frontend
2. Navigate to `http://localhost:3000`
3. Go to Workspace → Bookings → Create Booking
4. Fill in the form and submit
5. View the created booking with auto-generated number

### 3. Build a Custom Package

1. Go to Workspace → Packages → Create Package
2. Select items from the catalog
3. Watch the price calculate in real-time
4. Save and use it for bookings

## 🚧 Future Enhancements

- [ ] PDF invoice generation
- [ ] Email notifications
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] SMS notifications
- [ ] Advanced analytics with charts
- [ ] Export to Excel/CSV
- [ ] Image uploads for items
- [ ] WhatsApp integration
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Calendar view for bookings
- [ ] Inventory management

## 📞 Support

**Backend**: See `backend/README.md` and `backend/API_REFERENCE.md`  
**Frontend**: See `frontend/README.md`

---

**Built with ❤️ using Node.js, React, MongoDB, Material UI, and React Query**
