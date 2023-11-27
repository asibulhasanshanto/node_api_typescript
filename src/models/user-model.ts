import mongoose from 'mongoose';
import { IUser } from 'types';
import bcrypt from 'bcryptjs';
import Joi, { ObjectSchema } from 'joi';

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
      default: 'default.jpeg',
    },
    role: {
      type: String,
      default: 'user',
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpired: Date,
    emailVerifyToken: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre save hook that hash the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre save hook that add passwordChangeAt when password is changed
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangeAt = new Date(Date.now() - 1000);

  next();
});

// Return true if password is correct, otherwise return false
userSchema.methods.correctPassword = async function (candidatePassword: string, userPassword: string) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Return true if password is changed after JWT issued
userSchema.methods.passwordChangeAfter = function (JWTTimestamp: number) {
  if (this.passwordChangeAt) {
    const passwordChangeTimestamp = this.passwordChangeAt.getTime() / 1000;
    return passwordChangeTimestamp > JWTTimestamp;
  }
  return false;
};

export const validateUser = (user: IUser): Joi.ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    name: Joi.string().required().label('Name'),
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().min(4).max(20).required().label('Password'),
    avatar: Joi.string().label('Avatar'),
    role: Joi.string().valid('user', 'admin').label('Role'),
  });

  return schema.validate(user);
};

export const validateUserUpdate = (user: IUser): Joi.ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    name: Joi.string().label('Name'),
    email: Joi.string().email().label('Email'),
    avatar: Joi.string().label('Avatar'),
    role: Joi.string().valid('user', 'admin').label('Role'),
    emailVerifiedAt: Joi.date().label('Email Verified At'),
  });

  return schema.validate(user);
};

export const validateUserPassword = (user: IUser): Joi.ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    password: Joi.string().min(4).max(20).required().label('Password'),
  });

  return schema.validate(user);
};

export const validateUpdatePassword = (user: IUser): Joi.ValidationResult => {
  const schema: ObjectSchema = Joi.object({
    passwordCurrent: Joi.string().required().label('Current Password'),
    password: Joi.string().min(4).max(20).required().label('Password'),
    passwordConfirm: Joi.any()
      .equal(Joi.ref('password'))
      .required()
      .label('Confirm password')
      .messages({ 'any.only': '{{#label}} does not match' }),
  });

  return schema.validate(user);
};

export const UserModel = mongoose.model('User', userSchema);
