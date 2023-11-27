import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
const cloudinary = require('cloudinary').v2;
import streamifier from 'streamifier';
import catchAsync from '../utils/catch-async';
import AppError from '../utils/app-error';
import { get } from 'lodash';

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

// Upload image to the cloudinary cloud
const uploadCloud = (buffer: Buffer, folder: string) => {
  return new Promise((resolve, reject) => {
    const cloudinaryUploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
      },
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(cloudinaryUploadStream);
  });
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload an image.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadAvatar = upload.single('avatar');
export const uploadCoverPhoto = upload.single('coverPhoto');

export const saveImageUrl = (folderName: string) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    const result = await uploadCloud(req.file.buffer, folderName);
    const url = get(result, 'url');
    req.body[req.file.fieldname] = url;

    next();
  });
};
