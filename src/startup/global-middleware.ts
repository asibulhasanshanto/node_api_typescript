import express, { Application, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
const xss = require('xss-clean');
const hpp = require('hpp');
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';

export default (app: Application) => {
  // 1) GLOBAL MIDDLEWARE
  app.enable('trust proxy');

  // Enable CORS request
  app.use(cors());

  // Set security HTTP headers
  app.use(helmet());

  // Development Logging
  if (process.env.NODE_ENV === 'development') {
    app.use(require('morgan')('dev'));
  }

  // Limit request with the same API
  const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000, // It's allowed 1000 requests from the same IP within 1 hour
    message: 'Too many requests with this IP, Please try again in an hour!',
  });
  app.use('/api', limiter);

  // Body parser, reading data from body
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Serve cookie in the request object
  app.use(cookieParser());

  // Data sanitization against NOSQL query injection
  app.use(mongoSanitize());

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(hpp());

  // Compression
  app.use(compression());

  // Custom middleware example (uncomment if needed)
  // app.use((req: Request, res: Response, next: NextFunction) => {
  //   console.log(process.env.NODE_ENV);
  //   next();
  // });
};
