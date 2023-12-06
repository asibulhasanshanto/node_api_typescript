import { Request, Response, NextFunction } from 'express';
import {
  register as registerService,
  login as loginService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  updatePassword as updatePasswordService,
  verifyEmail as verifyEmailService,
} from '../services/auth-service';
import { generateJwtToken } from '../services/token-service';
import { validateUser, validateUserPassword, validateUpdatePassword } from '../models/user-model';
import catchAsync from '../utils/catch-async';
import AppError from '../utils/app-error';
import { logger } from '../logger';
import { get } from 'lodash';
import { IUser } from 'types';

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { error } = validateUser(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const user: IUser = await registerService(req.body);
  const token: string = generateJwtToken({ id: user._id });

  res.status(201).json(token);
});

/**
 * @desc    Login a user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required.', 400));
  }

  const user: IUser = await loginService(email, password);
  const token: string = generateJwtToken({ id: user._id });
  logger.info(`User with id [${user._id}] and role [${user.role}] logged in at ${new Date().toLocaleString()}`);

  res.status(200).json(token);
});

/**
 * @desc    Forgot password request
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.email) {
    return next(new AppError('Email address is required.', 400));
  }

  await forgotPasswordService(req.body.email);

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
  });
});

/**
 * @desc    Reset the password
 * @route   PATCH /api/auth/reset-password/resetToken
 * @access  Public
 */
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { error } = validateUserPassword(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const user: IUser = await resetPasswordService(req.params.resetToken, req.body.password);
  const token: string = generateJwtToken({ id: user._id });

  res.status(200).json(token);
});

/**
 * @desc    Update my current password
 * @route   PATCH /api/auth/update-password
 * @access  Private
 */
export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { error } = validateUpdatePassword(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const { passwordCurrent, password } = req.body;
  const user_id: string = get(req, 'user.id');
  const user: IUser = await updatePasswordService(user_id, passwordCurrent, password);
  const token: string = generateJwtToken({ id: user._id });

  res.status(200).json(token);
});

/**
 * @desc    Active account by email verification
 * @route   GET /api/auth/verify-email/token
 * @access  Public
 */
export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  if (!token) return next(new AppError('Token is required.', 400));

  await verifyEmailService(token);

  res.status(200).json({ status: 'success', message: 'Your account is now verified.' });
});
