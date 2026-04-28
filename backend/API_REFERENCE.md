# Quick API Reference

Base URL: `http://localhost:5000/api`

## Config Profile - Categories

### List all categories

```
GET /config/categories
```

### Create category

```
POST /config/categories
Body: {
  "name": "Food",
  "description": "Food items",
  "subcategories": [
    {"name": "Sabji"},
    {"name": "Roti"}
  ]
}
```

---

## Config Profile - Items

### List all items

```
GET /config/items
Query: ?category=Food&subcategory=Sabji&isActive=true
```

### Create item

```
POST /config/items
Body: {
  "name": "Kadhai Paneer",
  "category": "Food",
  "subcategory": "Sabji",
  "basePrice": 200,
  "priceType": "per_person"
}
```

### Get items by category

```
GET /config/items/category/Food
```

---

## Workspace - Packages

### Calculate price (before creating package)

```
POST /workspace/packages/calculate
Body: {
  "items": [
    {"itemId": "64abc...", "quantity": 1}
  ],
  "guestCount": 150,
  "discountType": "percentage",
  "discountValue": 10
}
```

### Create package

```
POST /workspace/packages
Body: {
  "name": "Premium Package",
  "category": "Gold",
  "items": [
    {"itemId": "64abc...", "quantity": 1}
  ],
  "guestCount": 150
}
```

### List all packages

```
GET /workspace/packages
Query: ?category=Gold&isActive=true
```

---

## Workspace - Bookings

### Calculate booking price

```
POST /workspace/bookings/calculate
Body: {
  "packageId": "64abc...",
  "guestCount": 150,
  "discountType": "percentage",
  "discountValue": 5
}
```

### Create booking

```
POST /workspace/bookings
Body: {
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "eventDetails": {
    "eventDate": "2026-06-15",
    "eventType": "Wedding",
    "venue": "Grand Hall",
    "guestCount": 150
  },
  "packageId": "64abc..."
}
```

### List bookings

```
GET /workspace/bookings
Query: ?status=confirmed&startDate=2026-01-01
```

### Update booking status

```
PUT /workspace/bookings/:id/status
Body: {
  "status": "confirmed"
}
```

---

## Workspace - Customers

### List all customers

```
GET /workspace/customers
Query: ?search=John&isActive=true
```

### Create customer

```
POST /workspace/customers
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "address": {
    "city": "Mumbai",
    "state": "Maharashtra"
  },
  "tags": ["VIP"]
}
```

### Get customer by phone

```
GET /workspace/customers/phone/9876543210
```

### Get customer stats

```
GET /workspace/customers/:id/stats
```

### Search customers

```
GET /workspace/customers/search?query=John
```

### Update customer

```
PUT /workspace/customers/:id
Body: {
  "notes": "Updated notes"
}
```

---

## Price Types

- `per_person`: Price × Guest Count × Quantity
- `flat_rate`: Price × Quantity
- `per_hour`: Price × Hours (quantity = hours)

## Booking Status

- `draft` - Initial state
- `confirmed` - Booking confirmed
- `cancelled` - Booking cancelled
- `completed` - Event completed
