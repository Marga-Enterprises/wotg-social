import * as methods from '../../utils/methods';
import { GET } from '../request';


export async function getBibleChaptersByParams(payload) {
  const params = methods.convertQueryString(payload);
  return GET(`/bibles?${params}`);
}

export async function getBibleVerses(payload) {
  return GET(`/bibles/${payload.book}/${payload.chapter}/${payload.verse}/${payload.language}`);
} 
