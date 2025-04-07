import * as types from '../types';
import { getBibleChaptersByParams, getBibleVerse } from '../../../services/api/bible';

export const getAllBiblesAction = (payload) => async (dispatch) => {
  try {
    const res = await getBibleChaptersByParams(payload);
    const { success, data } = res;

    if (success) {
      dispatch({
        type: types.GET_BIBLES_SUCCESS,
        payload: data.bibles,
      });
    }

    return res; // Return the response object in both success and error cases

  } catch (err) {
    return dispatch({
      type: types.GET_BIBLES_FAIL,
      payload: err.response?.data?.msg || "Something went wrong",
    });
  }
};

export const getBibleVersesAction = (payload) => async (dispatch) => {
  try {
    const res = await getBibleVerse(payload);
    const { success, data } = res;

    if (success) {
      dispatch({
        type: types.GET_BIBLE_VERSE_SUCCESS,
        payload: data.verses,
      });
    }

    return res; // Return the response object in both success and error cases

  } catch (err) {
    return dispatch({
      type: types.GET_BIBLE_VERSE_FAIL,
      payload: err.response?.data?.msg || "Something went wrong",
    });
  }
}