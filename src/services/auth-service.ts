import _ from 'lodash';
import { generateRandomToken, hashToken } from './token-service';
import { UserModel } from './../models/user-model';
import { IUser, RegisterPayload } from 'types';
import { getOneUser, getAllUsers, createNewUser } from './user-service';
import Email from './email-service';
import AppError from './../utils/app-error';

export const register = async (payload: RegisterPayload): Promise<IUser> => {
  const isExists = await getOneUser({ email: payload.email });
  if (isExists) {
    throw new AppError('Email is already exists.', 400);
  }

  const user = await createNewUser(_.pick(payload, ['name', 'email', 'password', 'role']));

  const token = generateRandomToken();
  user.emailVerifyToken = hashToken(token);
  await user.save({ validateBeforeSave: false });

  // Send email verification
  const verifyUrl = `${process.env.BASE_URL}/api/v1/auth/verify-email/${token}`;
  try {
    await new Email(user, verifyUrl).sendVerifyEmail();
  } catch (err) {
    console.log(err);
    user.emailVerifyToken = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError('There was an error sending the email.', 500);
  }

  return user;
};

export const login = async (email: string, password: string): Promise<IUser> => {
  const user = await UserModel.findOne({ email }).select('+password');
  const isMatch = await user?.correctPassword(password, user.password);
  if (!isMatch) {
    throw new AppError('Incorrect email or password.', 401);
  }

  return user;
};

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await getOneUser({ email });

  if (!user) {
    throw new AppError('There is no user with email address.', 404);
  }

  const resetToken = generateRandomToken();
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpired = new Date(Date.now() + parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN) * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.BASE_URL}/api/v1/auth/reset-password/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError('There was an error sending the email.', 500);
  }
};

export const resetPassword = async (resetToken: string, password: string): Promise<IUser> => {
  const hashedToken = hashToken(resetToken);
  const user = await getOneUser({
    passwordResetToken: hashedToken,
    passwordResetExpired: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired.', 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpired = undefined;
  return user.save();
};

export const updatePassword = async (
  currentUserId: string,
  passwordCurrent: string,
  password: string
): Promise<IUser> => {
  const user = await getOneUser({ _id: currentUserId }).select('+password');

  const isMatch = await user.correctPassword(passwordCurrent, user.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 401);
  }

  user.password = password;
  return user.save();
};

export const verifyEmail = async (token: string): Promise<IUser> => {
  const hashedToken = hashToken(token);

  let user = await getOneUser({
    emailVerifyToken: hashedToken,
  });

  if (!user) {
    throw new AppError('Token is invalid or already verified.', 400);
  }

  user.isVerified = true;
  user.emailVerifyToken = undefined;

  return user.save();
};
