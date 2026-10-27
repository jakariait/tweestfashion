require('dotenv').config(); // Load environment variables

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const compression = require('compression');
const mongoSanitize = require('./middlewares/mongoSanitize');
const xssMiddleware = require('./middlewares/xssMiddleware');

const router = require('./routes/api');

const app = express();

// ---------------------------
// MongoDB Connection
// ---------------------------
const URL = process.env.MONGO_URI;
if (!URL || !process.env.CLIENT_URL) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

mongoose
  .connect(URL, {
    autoIndex: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log('Database Connected'))
  .catch((err) => console.log('DB Connection Error:', err));

// ---------------------------
// CORS Configuration
// ---------------------------
const clientUrl = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.replace(/\/$/, ''))
  : [];

const corsOptions = {
  origin: clientUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Favicon'],
};

// ---------------------------
// Security Middlewares
// ---------------------------

// Trust proxy (needed for rate limiting behind proxies)
app.set('trust proxy', 1);

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Compression
app.use(compression());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors(corsOptions));

// Sanitize MongoDB queries to prevent NoSQL injection
app.use(mongoSanitize);

// Set secure HTTP headers
app.use(helmet());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Sanitize user input to prevent XSS attacks
app.use(xssMiddleware);

// ---------------------------
// Body Parsers
// ---------------------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ---------------------------
// Rate Limiting
// ---------------------------
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2000, // limit each IP
});
app.use(limiter);

// ---------------------------
// Routes
// ---------------------------
app.use('/api/', router);

// ---------------------------
// Multer Error Handler
// ---------------------------
app.use((err, req, res, next) => {
  if (err.name === 'MulterError' || err.message?.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

module.exports = app;
