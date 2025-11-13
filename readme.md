# ERP Backend API

A complete Node.js/Express backend for an Enterprise Resource Planning (ERP) system with MongoDB integration.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Finance Management**: Transaction tracking, financial metrics, and reporting
- **Inventory Management**: Product management, stock tracking, and reorder alerts
- **ML Integration**: Demand forecasting and stock optimization algorithms
- **RESTful API**: Well-structured endpoints with proper validation
- **Security**: Password hashing, JWT tokens, input validation

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Other**: CORS, dotenv

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── middleware/
│   │   └── auth.js               # JWT verification & authorization
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── Transaction.js        # Financial transaction model
│   │   └── Product.js            # Inventory product model
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication endpoints
│   │   ├── financeRoutes.js      # Finance endpoints
│   │   ├── inventoryRoutes.js    # Inventory endpoints
│   │   └── mlRoutes.js           # ML/Analytics endpoints
│   ├── scripts/
│   │   └── seedDatabase.js       # Database seeding script
│   └── app.js                    # Express app configuration
├── .env                          # Environment variables
├── package.json
└── README.md
```

## Installation

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/erp_system
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Using MongoDB service
sudo systemctl start mongodb

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed the Database

Populate the database with initial data:

```bash
node src/scripts/seedDatabase.js
```

This will create:
- 3 default users (admin, finance, inventory)
- 8 sample products
- 10 sample transactions

### 5. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## Default Login Credentials

After seeding the database, you can use these credentials:

| Role      | Email                  | Password     |
|-----------|------------------------|--------------|
| Admin     | admin@erp.com          | admin123     |
| Finance   | finance@erp.com        | finance123   |
| Inventory | inventory@erp.com      | inventory123 |

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "user"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@erp.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@erp.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Finance Management

All finance routes require authentication via `Authorization: Bearer <token>` header.

#### Get All Transactions
```http
GET /api/finance/transactions?status=completed&category=Revenue&page=1&limit=50
Authorization: Bearer <token>
```

#### Get Single Transaction
```http
GET /api/finance/transactions/:id
Authorization: Bearer <token>
```

#### Create Transaction (Admin/Finance only)
```http
POST /api/finance/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "vendor": "Acme Corp",
  "amount": 15000,
  "category": "Revenue",
  "status": "completed",
  "description": "Product sales",
  "paymentMethod": "bank_transfer"
}
```

#### Update Transaction (Admin/Finance only)
```http
PUT /api/finance/transactions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "amount": 15500
}
```

#### Delete Transaction (Admin/Finance only)
```http
DELETE /api/finance/transactions/:id
Authorization: Bearer <token>
```

#### Get Financial Metrics
```http
GET /api/finance/metrics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalRevenue": 120000,
  "outstandingAR": 28000,
  "totalExpenses": 10550,
  "netProfit": 109450,
  "totalAssets": 0,
  "totalLiabilities": 0
}
```

### Inventory Management

#### Get All Products
```http
GET /api/inventory/products?category=Electronics&lowStock=true&page=1&limit=50
Authorization: Bearer <token>
```

#### Get Single Product
```http
GET /api/inventory/products/:id
Authorization: Bearer <token>
```

#### Create Product (Admin/Inventory only)
```http
POST /api/inventory/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "sku": "PROD-009",
  "name": "New Product",
  "unitCost": 50.00,
  "quantityOnHand": 100,
  "reorderLevel": 20,
  "category": "Electronics",
  "supplier": "TechSupply Inc"
}
```

#### Update Product (Admin/Inventory only)
```http
PUT /api/inventory/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantityOnHand": 150,
  "unitCost": 55.00
}
```

#### Restock Product (Admin/Inventory only)
```http
PATCH /api/inventory/products/:id/restock
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 100
}
```

#### Adjust Product Quantity (Admin/Inventory only)
```http
PATCH /api/inventory/products/:id/adjust
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": -10,
  "reason": "Damaged items"
}
```

#### Delete Product (Admin only)
```http
DELETE /api/inventory/products/:id
Authorization: Bearer <token>
```

#### Get Inventory Metrics
```http
GET /api/inventory/metrics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalItems": 2575,
  "lowStockItems": 3,
  "totalValue": 87420.50,
  "categoriesCount": 6,
  "totalProducts": 8,
  "categories": ["Electronics", "Components", "Tools", "Safety", "Office"]
}
```

#### Get Low Stock Products
```http
GET /api/inventory/low-stock
Authorization: Bearer <token>
```

### ML & Analytics

#### Predict Demand
```http
POST /api/ml/predict-demand
Authorization: Bearer <token>
Content-Type: application/json

{
  "productIds": ["product_id_1", "product_id_2"],
  "forecastDays": 30
}
```

**Response:**
```json
{
  "forecasts": [
    {
      "productId": "...",
      "sku": "PROD-001",
      "productName": "Premium Widget A",
      "currentStock": 450,
      "predictedDemand": 380,
      "forecastedStock": 70,
      "recommendedOrder": 130,
      "reorderLevel": 100,
      "confidence": 0.92,
      "forecastPeriod": "30 days",
      "category": "Electronics"
    }
  ],
  "summary": {
    "totalProducts": 2,
    "productsNeedingReorder": 1,
    "totalRecommendedOrder": 130,
    "averageConfidence": 0.91
  }
}
```

#### Stock Optimization Analysis
```http
GET /api/ml/stock-optimization
Authorization: Bearer <token>
```

### Health Check

```http
GET /health
```

## Role-Based Access Control

| Route                    | Public | User | Inventory | Finance | Admin |
|--------------------------|--------|------|-----------|---------|-------|
| POST /auth/register      | ✓      | ✓    | ✓         | ✓       | ✓     |
| POST /auth/login         | ✓      | ✓    | ✓         | ✓       | ✓     |
| GET /finance/*           | ✗      | ✓    | ✓         | ✓       | ✓     |
| POST/PUT/DELETE finance  | ✗      | ✗    | ✗         | ✓       | ✓     |
| GET /inventory/*         | ✗      | ✓    | ✓         | ✓       | ✓     |
| POST/PUT inventory       | ✗      | ✗    | ✓         | ✗       | ✓     |
| DELETE /inventory/*      | ✗      | ✗    | ✗         | ✗       | ✓     |
| POST /ml/*               | ✗      | ✓    | ✓         | ✓       | ✓     |

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:

```json
{
  "error": "Error message",
  "details": ["Additional details if available"]
}
```

## Database Models

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (admin|finance|inventory|user),
  isActive: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

### Transaction Model
```javascript
{
  date: Date (required),
  vendor: String (required),
  amount: Number (required, min: 0),
  status: String (pending|completed|cancelled|failed),
  category: String (Revenue|Expense|Asset|Liability),
  description: String,
  invoiceNumber: String (unique),
  paymentMethod: String,
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

### Product Model
```javascript
{
  sku: String (unique, required, uppercase),
  name: String (required),
  quantityOnHand: Number (required, min: 0),
  unitCost: Number (required, min: 0),
  reorderLevel: Number (required, min: 0),
  category: String (required),
  description: String,
  supplier: String,
  location: String,
  isActive: Boolean,
  lastRestocked: Date,
  timestamps: true,
  virtuals: { isLowStock, totalValue }
}
```

## Security Best Practices

1. **Always use HTTPS in production**
2. **Change default JWT_SECRET** to a strong random string
3. **Set appropriate CORS origins** instead of allowing all
4. **Implement rate limiting** for authentication endpoints
5. **Enable MongoDB authentication** in production
6. **Use environment-specific configurations**
7. **Regular security audits** with `npm audit`
8. **Keep dependencies updated**

## Development Tips

### Testing with cURL

```bash
# Login and save token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.com","password":"admin123"}' \
  | jq -r '.token')

# Use token for authenticated requests
curl -X GET http://localhost:5000/api/inventory/products \
  -H "Authorization: Bearer $TOKEN"
```

### MongoDB Connection String Formats

```bash
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/erp_system

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erp_system

# With authentication
MONGODB_URI=mongodb://username:password@localhost:27017/erp_system?authSource=admin
```

## Deployment

### Using PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/app.js --name erp-backend

# View logs
pm2 logs erp-backend

# Monitor
pm2 monit
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
```

## License

ISC

## Support

For issues and questions, please open an issue in the repository.