import * as methods from '../../utils/methods';
import { GET, POST_FORM_DATA } from '../request';

export async function getAllBlogs(payload) {
  const params = methods.convertQueryString(payload);
  return GET(`/blogs?${params}`);
}

export async function getBlogById(payload) {
  return GET(`/blogs/${payload}`);
}

export async function uploadBlogVideo(payload) {
  console.log("🚀 [SERVICE API UPLOAD] Preparing upload for blog ID:", payload.id);
  
  console.log('[PAYLOAD BLOGS SERVICE API]', payload);

  const formData = new FormData();
  
  for (const key in payload) {
    if (payload[key] !== null && payload[key] !== undefined) {
      formData.append(key, payload[key]);
    }
  }

  console.log("📡 [SERVICE API UPLOAD] Sending request to backend...");
  try {
    const response = await POST_FORM_DATA(`/blogs/${payload.id}/upload-video`, { formData });
    console.log("✅ [SERVICE API UPLOAD] Upload successful:", response);
    return response;
  } catch (error) {
    console.log("❌ [SERVICE API UPLOAD] Upload error:", error.response?.data?.msg || error.message);
    throw error;
  }
}


