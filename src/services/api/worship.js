import * as methods from '../../utils/methods';

import { GET, POST } from '../request';

export async function getWorshipService() {
  return GET(`/worship`);
}

export async function createWorshipService(payload) {
  return POST('/worship', payload);
}