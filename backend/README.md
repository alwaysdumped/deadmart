# Live MART Backend API

Node.js/Express backend for the Live MART e-commerce platform.

## Features

- ✅ JWT-based authentication
- ✅ Email OTP verification
- ✅ Role-based access control (Customer, Retailer, Wholesaler, Delivery Partner)
- ✅ Product management with wholesaler tracking
- ✅ Order management with seller tracking
- ✅ Product reviews and ratings
- ✅ Google Maps integration (geocoding)
- ✅ MongoDB database

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env.example` to `.env`
- Update MongoDB URI if using Atlas
- Add email credentials for OTP (optional - will use console mode if not provided)
- Add Google Maps API key (optional - will use mock coordinates if not provided)

3. Start MongoDB (if running locally):
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/register` - Register user with OTP verification
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get products (filtered by role)
- `GET /api/products/my-products` - Get seller's products (protected)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (protected)
- `POST /api/products/buy-from-wholesaler` - Retailer buys from wholesaler (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (protected)

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders/my-orders` - Get user's orders (protected)
- `GET /api/orders/incoming` - Get incoming orders for sellers (protected)
- `GET /api/orders/available` - Get available orders for delivery partners (protected)
- `PUT /api/orders/:id/status` - Update order status (protected)
- `GET /api/orders/:id` - Get single order (protected)

### Reviews
- `GET /api/reviews/:productId` - Get product reviews
- `POST /api/reviews` - Create review (protected)
- `PUT /api/reviews/:id/helpful` - Mark review as helpful

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/livemart
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Google Maps (optional)
GOOGLE_MAPS_API_KEY=your_api_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Development Notes

- **OTP Mode**: If email credentials are not provided, OTPs will be logged to console
- **Maps Mode**: If Google Maps API key is not provided, mock coordinates will be used
- **Database**: MongoDB must be running before starting the server

## Testing

Use tools like Postman, Thunder Client, or curl to test the API endpoints.

Example login request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"customer"}'
```
