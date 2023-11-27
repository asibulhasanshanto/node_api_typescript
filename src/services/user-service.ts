import { UserModel } from '../models/user-model';

export const getAllUsers = () => {
  return UserModel.find();
};

export const getOneUser = (filter: object) => {
  return UserModel.findOne(filter);
};

export const createNewUser = (payload: object) => {
  const user = new UserModel(payload);

  return user.save();
};

export const updateOneUser = (filter: object, payload: object) => {
  return UserModel.findOneAndUpdate(filter, payload, { new: true });
};

export const deleteOneUser = (filter: object) => {
  return UserModel.findOneAndDelete(filter);
};
