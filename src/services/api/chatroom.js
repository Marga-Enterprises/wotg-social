// utils
import * as methods from '../../utils/methods';

import { GET, POST, PUT, DELETE } from '../request';


export async function getAllChatrooms(payload) {
  const params = methods.convertQueryString(payload);
  return GET(`/chatrooms?${params}`);
}

export async function createChatroom(payload) {
  return POST('/chatrooms', payload);
}
