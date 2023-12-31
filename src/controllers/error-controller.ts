import { Request, Response, NextFunction } from "express";
import AppError from "../utils/app-error";
import { logger } from "../logger";

const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err: any): AppError => {
  const fieldName = `${Object.keys(err.keyPattern)}`;
  const message = `${err.keyValue[fieldName]} ${fieldName} already exists`;
  return new AppError(message, 400);
};

const handleJWTError = (): AppError => {
  return new AppError("Invalid token! Please login again.", 400);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError("Token has expired. Please login again.", 401);
};

const handleFileUploadError = (): AppError => {
  return new AppError("Image Upload failed. Please try again.", 400);
};

const sendErrorDev = (err: AppError, req: Request, res: Response): void => {
  logger.error(err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, req: Request, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    logger.error(err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

export default (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "test"
  ) {
    let error: AppError = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.statusCode = err.code;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.statusCode === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (req.file) error = handleFileUploadError();

    sendErrorProd(error, req, res);
  } else if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  }
};
