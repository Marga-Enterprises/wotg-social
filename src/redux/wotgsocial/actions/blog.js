import { getAllBlogs, getBlogById } from '../../../services/api/blogs';

// TYPES
import * as types from '../types';

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

// New action to get blog by ID
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
