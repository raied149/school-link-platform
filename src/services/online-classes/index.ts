
import { createOnlineClass } from './createService';
import { getAllClasses, getClassesForTeacher, getClassesForStudent, getClassById } from './fetchService';
import { deleteOnlineClass } from './deleteService';
import { OnlineClass, OnlineClassWithDetails, CreateOnlineClassParams } from './types';
import { isValidUUID, DEV_USER_UUID } from './validation';

export const onlineClassService = {
  createOnlineClass,
  getAllClasses,
  getClassesForTeacher,
  getClassesForStudent,
  getClassById,
  deleteOnlineClass
};

export type {
  OnlineClass,
  OnlineClassWithDetails,
  CreateOnlineClassParams
};

export {
  isValidUUID,
  DEV_USER_UUID
};
