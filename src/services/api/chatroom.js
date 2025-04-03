// utils
import * as methods from '../../utils/methods';

import { GET, POST } from '../request';


export async function getAllChatrooms(payload) {
  const params = methods.convertQueryString(payload);
  return GET(`/chatrooms?${params}`);
}

export async function createChatroom(payload) {
  return POST('/chatrooms', payload);
}

export async function addParticipantsInChatroom(payload) {
  return POST('/chatrooms/add-participants', payload);
}