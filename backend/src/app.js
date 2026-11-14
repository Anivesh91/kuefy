const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorMiddleware');
const ApiError = require('./utils/apiError');
const { isOriginAllowed } = require('./config/cors');

const app = express();

// Trust reverse proxy (Render, Vercel, Railway, Nginx) so client IP is accurately captured
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());

// Strict limiter for authentication brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

// Targeted limiter for ticket lookup by phone
const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many ticket lookup attempts, please try again later.' },
});

// General API limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

app.use('/api', limiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/google', authLimiter);
app.use('/api/v1/tickets/lookup', lookupLimiter);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(new ApiError(403, `Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

if (process.env.NODE_ENV === 'production' && !process.env.COOKIE_SECRET) {
  console.warn('[Security Warning] COOKIE_SECRET environment variable is missing in production!');
}
app.use(cookieParser(process.env.COOKIE_SECRET || 'queueless_cookie_secret'));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Kuefy API Server' });
});

app.use('/api/v1', routes);

app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found.`));
});

app.use(errorHandler);

module.exports = app;
