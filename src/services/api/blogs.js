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
  console.log("📡 [SERVICE API UPLOAD] Preparing upload for blog ID:", payload.id);
  console.log("📦 [SERVICE API UPLOAD] Payload received:", payload);

  const formData = new FormData();

  for (const key in payload) {
    if (payload[key] !== null && payload[key] !== undefined) {
      formData.append(key, payload[key]);
      console.log(`📌 [SERVICE API UPLOAD] Added ${key} to FormData`);
    }
  }

  console.log("📤 [SERVICE API UPLOAD] Sending request to backend...");

  try {
    const response = await PUT_FORM_DATA(`/blogs/${payload.id}/upload-video`, { formData });
    console.log("✅ [SERVICE API UPLOAD] Upload successful. Response:", response);
    return response;
  } catch (error) {
    console.log("❌ [SERVICE API UPLOAD] Upload error:", error.response?.data?.msg || error.message);
    throw error;
  }
}

