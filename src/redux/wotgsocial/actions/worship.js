import { getWorshipService, createWorshipService } from '../../../services/api/worship';

// Types
import * as types from '../types';

// Get Latest Worship
export const getWorshipServiceAction = () => async (dispatch) => {
  dispatch({ type: types.GET_LATEST_WORSHIP_REQUEST });

  return getWorshipService().then((res) => {
    if (res.success) {
      dispatch({
        type: types.GET_LATEST_WORSHIP_SUCCESS,
        payload: res.data,
      });
    } else {
      dispatch({
        type: types.GET_LATEST_WORSHIP_FAIL,
        payload: res.msg,
      });
    }

    return res;
  });
};

// Update Latest Worship
export const createWorshipServiceAction = (videoId) => async (dispatch) => {
  dispatch({ type: types.UPDATE_LATEST_WORSHIP_REQUEST });

  return createWorshipService({ videoId }).then((res) => {
    if (res.success) {
      dispatch({
        type: types.UPDATE_LATEST_WORSHIP_SUCCESS,
        payload: res.data,
      });
    } else {
      dispatch({
        type: types.UPDATE_LATEST_WORSHIP_FAIL,
        payload: res.msg,
      });
    }

    return res;
  });
};

// redux/actions/worship.js
export const setWorshipStatusFromSocket = (videoId) => (dispatch) => {
  dispatch({
    type: types.UPDATE_LATEST_WORSHIP_SUCCESS,
    payload: { videoId },
  });
};
