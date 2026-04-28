# Karalaya Wedding Package Management System - Backend

## Tech Stack

- **Node.js** with Express
- **MongoDB** with Mongoose
- **Environment Variables** with dotenv

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── models/
│   │   ├── Category.model.js     # Config: Categories
│   │   ├── Item.model.js         # Config: Items catalog
│   │   ├── Package.model.js      # Workspace: Packages
│   │   ├── Booking.model.js      # Workspace: Bookings
│   │   └── Customer.model.js     # Workspace: Customer tracking
│   ├── controllers/
│   │   ├── config/
│   │   │   ├── category.controller.js
│   │   │   └── item.controller.js
│   │   └── workspace/
│   │       ├── package.controller.js
│   │       ├── booking.controller.js
│   │       └── customer.controller.js
│   ├── routes/
│   │   ├── config.routes.js      # Config profile routes
│   │   └── workspace.routes.js   # Workspace profile routes
│   ├── services/
│   │   └── pricing.service.js    # Price calculation logic
│   └── middleware/
│       ├── asyncHandler.js
│       ├── validation.js
│       └── errorHandler.js
├── server.js                     # Entry point
├── package.json
├── .env.example
└── .gitignore
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/karalaya_wedding
GST_PERCENTAGE=18
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For macOS (with Homebrew)
brew services start mongodb-community

# Or start manually
mongod
```

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

### Config Profile APIs (Master Data Management)

#### Categories

- `GET /api/config/categories` - Get all categories
- `GET /api/config/categories/:id` - Get category by ID
- `POST /api/config/categories` - Create new category
- `PUT /api/config/categories/:id` - Update category
- `DELETE /api/config/categories/:id` - Delete category
- `POST /api/config/categories/:id/subcategories` - Add subcategory

**Example: Create Category**

```json
POST /api/config/categories
{
  "name": "Food",
  "description": "Food items",
  "subcategories": [
    { "name": "Sabji", "description": "Vegetable dishes" },
    { "name": "Roti", "description": "Bread items" },
    { "name": "Rice", "description": "Rice items" }
  ]
}
```

#### Items

- `GET /api/config/items` - Get all items (query: category, subcategory, isActive, search)
- `GET /api/config/items/:id` - Get item by ID
- `GET /api/config/items/category/:category` - Get items by category
- `GET /api/config/items/categories` - Get all unique categories
- `POST /api/config/items` - Create new item
- `PUT /api/config/items/:id` - Update item
- `DELETE /api/config/items/:id` - Delete item

**Example: Create Item**

```json
POST /api/config/items
{
  "name": "Kadhai Paneer",
  "category": "Food",
  "subcategory": "Sabji",
  "description": "Spicy paneer curry",
  "basePrice": 200,
  "priceType": "per_person",
  "unit": "plate",
  "specifications": [
    { "key": "Spice Level", "value": "Medium" },
    { "key": "Serving Size", "value": "200g" }
  ]
}
```

### Workspace Profile APIs (Package Building & Booking)

#### Packages

- `GET /api/workspace/packages` - Get all packages (query: category, isActive)
- `GET /api/workspace/packages/:id` - Get package by ID
- `POST /api/workspace/packages` - Create new package
- `PUT /api/workspace/packages/:id` - Update package
- `DELETE /api/workspace/packages/:id` - Delete package
- `POST /api/workspace/packages/calculate` - Calculate package price

**Example: Create Package**

```json
POST /api/workspace/packages
{
  "name": "Premium Wedding Package",
  "description": "Complete wedding package",
  "category": "Gold",
  "items": [
    {
      "itemId": "6479abc123def456789",
      "quantity": 1
    },
    {
      "itemId": "6479abc123def456790",
      "quantity": 2
    }
  ],
  "guestCount": 150,
  "discountType": "percentage",
  "discountValue": 10
}
```

**Example: Calculate Price**

```json
POST /api/workspace/packages/calculate
{
  "items": [
    {
      "itemId": "6479abc123def456789",
      "quantity": 1
    }
  ],
  "guestCount": 150,
  "discountType": "percentage",
  "discountValue": 10
}

Response:
{
  "success": true,
  "data": {
    "subtotal": 30000,
    "discountAmount": 3000,
    "tax": 4860,
    "taxPercentage": 18,
    "totalAmount": 31860,
    "breakdown": [
      {
        "itemName": "Kadhai Paneer",
        "category": "Food",
        "priceType": "per_person",
        "unitPrice": 200,
        "quantity": 150,
        "totalPrice": 30000
      }
    ]
  }
}
```

#### Bookings

- `GET /api/workspace/bookings` - Get all bookings (query: status, startDate, endDate)
- `GET /api/workspace/bookings/:id` - Get booking by ID
- `GET /api/workspace/bookings/number/:bookingNumber` - Get booking by number
- `POST /api/workspace/bookings` - Create new booking
- `PUT /api/workspace/bookings/:id` - Update booking
- `PUT /api/workspace/bookings/:id/status` - Update booking status
- `DELETE /api/workspace/bookings/:id` - Delete booking
- `POST /api/workspace/bookings/calculate` - Calculate booking price

**Example: Create Booking**

```json
POST /api/workspace/bookings
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "eventDetails": {
    "eventDate": "2026-06-15",
    "eventType": "Wedding",
    "venue": "Grand Hall, Mumbai",
    "guestCount": 150,
    "additionalInfo": "Evening event"
  },
  "packageId": "6479abc123def456791",
  "discountType": "percentage",
  "discountValue": 5,
  "notes": "VIP customer"
}

Response:
{
  "success": true,
  "data": {
    "bookingNumber": "KRL2604001",
    ...
  },
  "message": "Booking created successfully with number: KRL2604001"
}
```

#### Customers

- `GET /api/workspace/customers` - Get all customers (query: search, isActive)
- `GET /api/workspace/customers/:id` - Get customer by ID with booking history
- `GET /api/workspace/customers/phone/:phone` - Get customer by phone number
- `GET /api/workspace/customers/:id/stats` - Get customer statistics
- `GET /api/workspace/customers/search` - Search customers (query: query)
- `POST /api/workspace/customers` - Create new customer
- `PUT /api/workspace/customers/:id` - Update customer
- `DELETE /api/workspace/customers/:id` - Delete customer

**Example: Create Customer**

```json
POST /api/workspace/customers
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "alternatePhone": "9876543211",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "landmark": "Near Central Mall"
  },
  "notes": "Preferred customer",
  "tags": ["VIP", "Corporate"]
}

Response:
{
  "success": true,
  "data": {
    "_id": "64abc...",
    "name": "John Doe",
    "phone": "9876543210",
    "totalBookings": 0,
    "totalSpent": 0,
    ...
  },
  "message": "Customer created successfully"
}
```

**Example: Get Customer Stats**

```json
GET /api/workspace/customers/:id/stats

Response:
{
  "success": true,
  "data": {
    "totalBookings": 5,
    "confirmedBookings": 3,
    "completedBookings": 2,
    "cancelledBookings": 0,
    "totalSpent": 450000,
    "averageBookingValue": 90000,
    "upcomingEvents": 1
  }
}
```

**Note**: When creating a booking, the system automatically creates or updates the customer record for tracking purposes.

## Data Models

### Category

- name (String, required, unique)
- description (String)
- subcategories (Array of {name, description})
- isActive (Boolean)
- displayOrder (Number)

### Item

- name (String, required)
- category (String, required)
- subcategory (String)
- description (String)
- basePrice (Number, required)
- priceType (Enum: per_person, flat_rate, per_hour)
- unit (String)
- specifications (Array of {key, value})
- isActive (Boolean)
- imageUrl (String)
- tags (Array of String)
- displayOrder (Number)

### Package

- name (String, required)
- description (String)
- category (Enum: Bronze, Silver, Gold, Platinum, Diamond, Custom)
- items (Array of item references with quantity)
- guestCount (Number)
- pricing (Object: subtotal, discount, tax, total)
- isActive (Boolean)
- notes (String)

### Booking

- bookingNumber (String, auto-generated: KRL2604XXXX)
- customer (Object: name, email, phone)
- eventDetails (Object: date, type, venue, guestCount)
- package (Reference to Package with items snapshot)
- pricing (Object: subtotal, discount, tax, total)
- status (Enum: draft, confirmed, cancelled, completed)
- notes (String)

### Customer

- name (String, required)
- email (String)
- phone (String, required, unique)
- alternatePhone (String)
- address (Object: street, city, state, pincode, landmark)
- notes (String)
- bookings (Array of Booking references)
- totalBookings (Number)
- totalSpent (Number)
- tags (Array of String)
- isActive (Boolean)

## Pricing Logic

The system calculates prices based on:

1. **Item Price Type**:
   - `per_person`: price × guestCount × quantity
   - `flat_rate`: price × quantity
   - `per_hour`: price × hours (quantity = hours)

2. **Discounts**:
   - `percentage`: subtotal × (discount% / 100)
   - `flat`: fixed discount amount

3. **Tax**: (subtotal - discount) × 18% (GST)

4. **Total**: subtotal - discount + tax

## Testing with cURL

### Create a Category

```bash
curl -X POST http://localhost:5000/api/config/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Food",
    "subcategories": [{"name": "Sabji"}, {"name": "Roti"}]
  }'
```

### Create an Item

```bash
curl -X POST http://localhost:5000/api/config/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kadhai Paneer",
    "category": "Food",
    "subcategory": "Sabji",
    "basePrice": 200,
    "priceType": "per_person"
  }'
```

### Health Check

```bash
curl http://localhost:5000/health
```

## Response Format

All API responses follow this format:

**Success:**

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

**Error:**

```json
{
  "success": false,
  "error": "Error message",
  "details": [...]
}
```

## Development Tips

1. **MongoDB Connection**: Ensure MongoDB is running before starting the server
2. **Environment Variables**: Copy `.env.example` to `.env` and configure
3. **Auto-reload**: Use `npm run dev` for automatic server restart on file changes
4. **API Testing**: Use Postman, Insomnia, or cURL for testing endpoints
5. **Logs**: Check console logs for request details (using Morgan middleware)

## Next Steps

1. Install and run the backend
2. Test the APIs with sample data
3. Build the React frontend
4. Connect frontend to backend APIs
