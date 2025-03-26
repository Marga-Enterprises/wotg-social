import * as methods from '../../utils/methods';
import { GET } from '../request';


export async function getBibleChaptersByParams(payload) {
  const params = methods.convertQueryString(payload);
  return GET(`/bibles?${params}`);
}
