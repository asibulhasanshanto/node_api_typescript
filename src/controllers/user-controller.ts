import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import {
  getAllUsers as getAllUsersService,
  getOneUser as getOneUserService,
  createNewUser as createNewUserService,
  updateOneUser as updateOneUserService,
  deleteOneUser as deleteOneUserService,
} from '../services/user-service';
import { validateUser, validateUserUpdate } from '../models/user-model';
import catchAsync from '../utils/catch-async';
import AppError from '../utils/app-error';
import { get } from 'lodash';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (admin)
 */
export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const allUsers = await getAllUsersService();

  res.status(200).json(allUsers);
});

/**
 * @desc    Get single user
 * @route   GET /api/users/id
 * @access  Private (admin)
 */
export const getOneUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await getOneUserService({ _id: req.params.id });
  if (!user) return next(new AppError('No user found with this id.', 404));

  res.status(200).json(user);
});

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private (admin)
 */
export const createNewUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { error } = validateUser(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const payload = _.pick(req.body, ['name', 'email', 'password', 'avatar', 'role']);
  const newUser = await createNewUserService(payload);

  res.status(201).json(newUser);
});

/**
 * @desc    Update single user
 * @route   PATCH /api/users/id
 * @access  Private (admin)
 */
export const updateOneUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { error } = validateUserUpdate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const payload = _.pick(req.body, ['name', 'email', 'avatar', 'role', 'emailVerifiedAt']);
  const updateUser = await updateOneUserService({ _id: req.params.id }, payload);
  if (!updateUser) return next(new AppError('No user found with this id.', 404));

  res.status(200).json(updateUser);
});

/**
 * @desc    Delete single user
 * @route   PATCH /api/users/id
 * @access  Private (admin)
 */
export const deleteOneUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const deleteUser = await deleteOneUserService({ _id: req.params.id });
  if (!deleteUser) return next(new AppError('No user found with this id.', 404));

  res.status(204).send();
});

/**
 * @desc    Update current user data
 * @route   PATCH /api/users/update-me
 * @access  Private
 */
export const updateMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { error } = validateUserUpdate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const payload = _.pick(req.body, ['name', 'email', 'avatar']);
  const user_id = get(req, 'user.id') as string;
  const updateUser = await updateOneUserService({ _id: user_id }, payload);

  res.status(200).json(updateUser);
});

/**
 * @desc    Get current user profile data
 * @route   GET /api/users/my-profile
 * @access  Private
 */
export const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user_id = get(req, 'user.id') as string;
  const profile = await getOneUserService({ _id: user_id });

  res.status(200).json(profile);
});
