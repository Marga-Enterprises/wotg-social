// utils
import * as methods from '../../utils/methods';

import { GET, POST, PUT, DELETE } from '../request';


export async function getAllChatrooms(payload) {
  return GET('/chatrooms', payload);
}

export async function createChatroom(payload) {
  return POST('/chatrooms', payload);
}
