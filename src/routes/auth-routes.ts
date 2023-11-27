import express from 'express';
import {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
  updatePassword,
} from '../controllers/auth-controller';
import { protect } from '../middlewares/auth-middleware';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:resetToken', resetPassword);
router.get('/verify-email/:token', verifyEmail);

router.patch('/update-password', protect, updatePassword);

export = router;
