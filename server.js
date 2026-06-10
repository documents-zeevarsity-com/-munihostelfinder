require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const hostelRoutes = require('./routes/hostels');
const bookingRoutes = require('./routes/bookings');

const app = express();

// ---------------------------------------------------------------------------
// Startup Validation
// ---------------------------------------------------------------------------
const requiredEnv = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`FATAL ERROR: ${key} is not defined in .env`);
    process.exit(1);
  }
});

// ---------------------------------------------------------------------------
// Swagger Documentation Setup
// ---------------------------------------------------------------------------
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'MuniHostelFinder API',
      version: '1.0.0',
      description: 'Production API documentation for Muni Hostel Finder',
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 4000}` },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API docs
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------
app.use(helmet());

// ---------------------------------------------------------------------------
// Request logging
// ---------------------------------------------------------------------------
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Stricter rate limiter for auth routes (applied per-route as well)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' },
});

// ---------------------------------------------------------------------------
// CORS – restrict to known origins in production
// ---------------------------------------------------------------------------
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// ---------------------------------------------------------------------------
// Body parsing (stripe signatures would need raw before this — not needed yet)
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));

// ---------------------------------------------------------------------------
// Health check (no rate limit needed but harmless)
// ---------------------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ 
      status: 'ok', 
      uptime: process.uptime(),
      database: 'connected' 
    });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/bookings', bookingRoutes);

// ---------------------------------------------------------------------------
// 404 catch-all
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err, req, res, _next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy: origin not allowed' });
  }

  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  console.error(`[${new Date().toISOString()}] ${err.stack}`);

  res.status(statusCode).json({
    status: status,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
