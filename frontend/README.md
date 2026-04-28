# Karalaya Wedding Package Management - Frontend

React frontend application built with Material UI, React Query, and Tailwind CSS.

## Tech Stack

- **React** 18.2
- **Material UI** 5.14 - UI component library
- **React Query** (TanStack Query) 5.12 - Server state management
- **React Router** 6.20 - Routing
- **Tailwind CSS** 3.3 - Utility-first CSS
- **Axios** - HTTP client

## Features

### Config Profile

- **Categories**: Manage food categories and subcategories
- **Items**: Create and manage catalog items with pricing

### Workspace Profile

- **Packages**: Build custom wedding packages from catalog items
- **Bookings**: Create and manage event bookings with real-time pricing
- **Customers**: Track customer information and booking history

### Key Capabilities

- Real-time price calculation with discounts and tax
- Responsive design for mobile and desktop
- Auto-generated booking numbers
- Customer statistics and insights
- Search and filter functionality

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

The `.env` file is already configured:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Make sure the backend is running on port 5000.

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Common/
│   │   │   ├── Loading.js
│   │   │   └── ErrorMessage.js
│   │   └── Layout/
│   │       └── Layout.js
│   ├── hooks/
│   │   ├── useConfig.js       # Config profile hooks
│   │   └── useWorkspace.js    # Workspace profile hooks
│   ├── pages/
│   │   ├── Config/
│   │   │   ├── Categories.js
│   │   │   └── Items.js
│   │   ├── Workspace/
│   │   │   ├── Packages.js
│   │   │   ├── PackageBuilder.js
│   │   │   ├── Bookings.js
│   │   │   ├── CreateBooking.js
│   │   │   ├── BookingDetails.js
│   │   │   ├── Customers.js
│   │   │   └── CustomerDetails.js
│   │   └── Dashboard.js
│   ├── services/
│   │   ├── api.js              # Axios instance
│   │   ├── configService.js    # Config API calls
│   │   └── workspaceService.js # Workspace API calls
│   ├── utils/
│   │   └── helpers.js          # Utility functions
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Available Scripts

- **`npm start`** - Start development server
- **`npm run build`** - Build for production
- **`npm test`** - Run tests

## Usage Guide

### 1. Setup Master Data (Config Profile)

1. **Add Categories**
   - Navigate to Config → Categories
   - Create categories like "Food", "Decoration", "Photography"
   - Add subcategories (e.g., Sabji, Roti under Food)

2. **Add Items**
   - Navigate to Config → Items
   - Add items to your catalog with pricing
   - Choose price type: per_person, flat_rate, or per_hour

### 2. Create Packages (Workspace)

1. **Build Package**
   - Navigate to Workspace → Packages
   - Click "Create Package"
   - Add items from catalog
   - Set guest count
   - Apply discounts (optional)
   - Price is calculated automatically

### 3. Create Bookings

1. **New Booking**
   - Navigate to Workspace → Bookings
   - Click "Create Booking"
   - Enter customer details
   - Fill event information
   - Select package
   - Review calculated price
   - Submit booking

2. **Manage Bookings**
   - View all bookings
   - Update booking status
   - View detailed booking information

### 4. Customer Management

1. **View Customers**
   - Navigate to Workspace → Customers
   - Search by name, phone, or email
   - View customer statistics

2. **Customer Details**
   - Click on a customer to view:
     - Contact information
     - Booking history
     - Total spent
     - Average booking value

## API Integration

All API calls are managed through React Query hooks:

### Config Hooks (`useConfig.js`)

- `useCategories()` - Fetch categories
- `useItems()` - Fetch items
- `useCreateCategory()` - Create category
- `useCreateItem()` - Create item
- And more...

### Workspace Hooks (`useWorkspace.js`)

- `usePackages()` - Fetch packages
- `useBookings()` - Fetch bookings
- `useCustomers()` - Fetch customers
- `useCalculatePackage()` - Calculate package price
- `useCreateBooking()` - Create booking
- And more...

## Design Features

### Material UI Theme

- Custom primary color: Sky Blue (#0ea5e9)
- Custom secondary color: Purple (#8b5cf6)
- Consistent spacing and typography
- Custom button and card styles

### Responsive Design

- Mobile-first approach
- Collapsible sidebar on mobile
- Responsive tables and grids
- Touch-friendly UI elements

### UX Features

- Real-time price calculations
- Loading states
- Error handling with retry
- Form validation
- Confirmation dialogs
- Search and filtering

## Helper Functions

Located in `utils/helpers.js`:

- `formatCurrency(amount)` - Format numbers as Indian Rupees
- `formatDate(date)` - Format dates in readable format
- `formatDateTime(date)` - Format with time
- `getStatusColor(status)` - Get color for booking status
- `getPriceTypeLabel(type)` - Get human-readable price type

## React Query Configuration

Configured in `App.js`:

- 5-minute stale time
- Automatic refetch disabled on window focus
- 1 retry attempt on failure
- React Query DevTools included (bottom-left corner)

## Troubleshooting

### Backend Connection Issues

- Ensure backend is running on `http://localhost:5000`
- Check `.env` file has correct `REACT_APP_API_URL`
- Check browser console for CORS errors

### Build Errors

- Delete `node_modules` and run `npm install` again
- Clear npm cache: `npm cache clean --force`

### Style Issues

- Ensure Tailwind is properly configured
- Check that PostCSS is processing correctly
- Verify Material UI theme is applied

## Production Build

```bash
# Build for production
npm run build

# The build folder will contain optimized production files
# Serve with any static file server
```

## Next Steps

1. Add authentication and authorization
2. Implement PDF invoice generation
3. Add email notifications
4. Implement payment gateway integration
5. Add analytics dashboard with charts
6. Export bookings to Excel/CSV
7. Add image upload for items
8. Implement dark mode
9. Add multi-language support

## Support

For issues or questions, check:

- Backend API documentation in `backend/README.md`
- API reference in `backend/API_REFERENCE.md`
