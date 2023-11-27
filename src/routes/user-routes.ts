import express from 'express';
import {
  getMyProfile,
  updateMe,
  getAllUsers,
  createNewUser,
  getOneUser,
  updateOneUser,
  deleteOneUser,
} from '../controllers/user-controller';
import { protect, verified, restrictTo } from '../middlewares/auth-middleware';
import { uploadAvatar, saveImageUrl } from '../middlewares/image-middleware';

const router = express.Router();

router.use(protect);

router.get('/my-profile', getMyProfile);
router.patch('/update-me', [uploadAvatar, saveImageUrl('User')], updateMe);

router
  .route('/')
  .get(getAllUsers)
  .post([uploadAvatar, saveImageUrl('User')], createNewUser);

router.route('/:id').get(getOneUser).patch(updateOneUser).delete(deleteOneUser);
//   .delete(restrictTo('admin'), deleteOneUser);router.get('/my-profile', verified, getMyProfile);
// router.patch('/update-me', [verified, uploadAvatar, saveImageUrl('User')], updateMe);

// router
//   .route('/')
//   .get(getAllUsers)
//   .post(restrictTo('admin'), [uploadAvatar, saveImageUrl('User')], createNewUser);

// router
//   .route('/:id')
//   .get(restrictTo('admin'), getOneUser)
//   .patch(restrictTo('admin'), updateOneUser)
//   .delete(restrictTo('admin'), deleteOneUser);

export = router;
