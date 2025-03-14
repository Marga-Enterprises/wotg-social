import * as methods from '../../utils/methods';
import { GET, PUT_FORM_DATA } from '../request';

export async function getAllBlogs(payload) {
  const params = methods.convertQueryString(payload);
  return GET(`/blogs?${params}`);
}

export async function getBlogById(payload) {
  return GET(`/blogs/${payload}`);
}

export async function uploadBlogVideo(payload) {
  const formData = new FormData();
  
  for (const key in payload) {
    if (payload[key] !== null && payload[key] !== undefined) {
      formData.append(key, payload[key]);
    }
  }

  try {
    return await PUT_FORM_DATA(`/blogs/${payload.id}/upload-video`, { formData });
  } catch (error) {
    throw error;
  }
}
