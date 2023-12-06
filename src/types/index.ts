import { Document } from 'mongoose';
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: string;
  passwordChangeAt?: Date;
  passwordResetToken?: string;
  passwordResetExpired?: Date;
  emailVerifyToken?: string;
  isVerified: boolean;
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  passwordChangeAfter(JWTTimestamp: number): boolean;
}


export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}
