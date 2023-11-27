import { Application, Request, Response, NextFunction } from 'express';
import userRouter from '../routes/user-routes';
import authRouter from '../routes/auth-routes';
import globalErrorHandler from '../controllers/error-controller';
import AppError from '../utils/app-error';

export default (app: Application) => {
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', userRouter);

  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.method} ${req.originalUrl} on this server.`, 404));
  });

  app.use(globalErrorHandler);
};
