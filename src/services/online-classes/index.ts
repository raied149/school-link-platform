
import { createOnlineClass } from './createService';
import { getOnlineClassesForUser, getOnlineClassesByDateSection } from './fetchService';
import { deleteOnlineClass } from './deleteService';
import { OnlineClass, OnlineClassWithDetails, CreateOnlineClassParams } from './types';
import { isValidUUID, DEV_USER_UUID } from './validation';

export const onlineClassService = {
  createOnlineClass,
  getOnlineClassesForUser,
  getOnlineClassesByDateSection,
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
