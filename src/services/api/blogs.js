import * as methods from '../../utils/methods';

import { GET, POST } from '../request';

export async function getAllBlogs(payload) {
  const params = methods.convertQueryString(payload);
  return GET(`/blogs?${params}`);
}

export async function getBlogById(payload) {
  return GET('/blogs', payload);
}