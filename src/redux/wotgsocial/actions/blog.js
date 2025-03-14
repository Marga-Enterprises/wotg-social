import { getAllBlogs, getBlogById, uploadBlogVideo } from '../../../services/api/blogs';

// TYPES
import * as types from '../types';

// Fetch all blogs
export const getAllBlogsAction = (payload) => async (dispatch) => {
  try {
    const res = await getAllBlogs(payload);
    const { success, data } = res;

    if (success) {
      dispatch({
        type: types.BLOGS_LIST_SUCCESS,
        payload: data.blogs,
      });
    }

    return res; // Return the response object in both success and error cases

  } catch (err) {
    return dispatch({
      type: types.BLOGS_LIST_FAIL,
      payload: err.response.data.msg,
    });
  }
};

// Fetch blog by ID
export const getBlogByIdAction = (id) => async (dispatch) => {
  try {
    const res = await getBlogById(id);
    const { success, data } = res;

    if (success) {
      dispatch({
        type: types.BLOG_GET_ID_SUCCESS,
        payload: data,
      });
    }

    return res; // Return response object

  } catch (err) {
    return dispatch({
      type: types.BLOG_GET_ID_FAIL,
      payload: err.response?.data?.msg || "Something went wrong",
    });
  }
};

// Upload blog video
export const uploadBlogVideoAction = (payload) => async (dispatch) => {
  console.log("📡 [UPLOAD ACTION] Upload process started with payload:", payload);

  try {
    dispatch({ type: types.BLOG_VIDEO_UPLOAD_REQUEST });
    console.log("⏳ [UPLOAD ACTION] Dispatching BLOG_VIDEO_UPLOAD_REQUEST...");

    const res = await uploadBlogVideo(payload);
    const { success, data } = res;

    if (success) {
      console.log("✅ [UPLOAD ACTION] Video uploaded successfully:", data);
      dispatch({
        type: types.BLOG_VIDEO_UPLOAD_SUCCESS,
        payload: data, // Store uploaded video URL
      });
    } else {
      console.log("⚠️ [UPLOAD ACTION] Upload failed. Response:", res);
    }

    return res; // Return response object

  } catch (err) {
    const errorMsg = err.response?.data?.msg || "Video upload failed";
    console.log("❌ [UPLOAD ACTION] Upload error:", errorMsg);
    
    dispatch({
      type: types.BLOG_VIDEO_UPLOAD_FAIL,
      payload: errorMsg,
    });

    return err;
  }
};

