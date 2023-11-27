import { Request, Response, NextFunction } from "express";
import {getOneUser} from "../services/user-service";
import {verifyJwtToken} from "../services/token-service";
import AppError from "../utils/app-error";
import catchAsync from "../utils/catch-async";
import { merge, get } from "lodash";

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Getting token and check if it's there
    let token: string | undefined;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    // 2) Verification token
    const decoded = await verifyJwtToken(token);

    // 3) Check if user still exists
    const currentUser = await getOneUser({ _id: decoded.id });
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }

    // 4) Check if the user changed the password after the token was issued
    if (currentUser.passwordChangeAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    merge(req, { user: currentUser });
    next();
  }
);

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user_role = get(req, "user.role") as string;
    if (!roles.includes(user_role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }

    next();
  };
};

export const verified = (req: Request, res: Response, next: NextFunction) => {
  const is_verified = get(req, "user.isVerified") as string;

  if (is_verified) return next();

  return next(new AppError("Your email address is not verified.", 403));
};
