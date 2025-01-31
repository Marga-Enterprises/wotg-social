// utils
import * as methods from '../../utils/methods';

import { GET, POST, PUT_FORM_DATA, DELETE } from '../request';

import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:5000';

export async function loginFunc(payload) {
  return POST('/auth/login', payload);
}

export async function registerFunc(payload) {
  return POST('/auth/register', payload);
}

export async function getAllUsers(payload) {
  const params = methods.convertQueryString(payload);
  return GET(`/users?${params}`);
}

export async function updateUser(payload) {
  const formData = new FormData();

  for (const key in payload) {
    if (payload[key] !== null && payload[key] !== undefined) {
      formData.append(key, payload[key]);
    }
  }

  return PUT_FORM_DATA(`/users/${payload.id}`, { formData });
}


export async function getUser(payload) {
  return GET(`/users/${payload.id}`);
};
