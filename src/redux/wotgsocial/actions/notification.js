import { getNotificationsByParams } from "../../../services/api/notification";

import * as types from "../types";

export const getNotifications = (payload) => async (dispatch) => {
  try {
    const res = await getNotificationsByParams(payload);

    if (res.success) {
        dispatch({
            type: types.NOTIFICATION_LIST_SUCCESS,
            payload: res.data.notifications,
        });
    } else {
        dispatch({
            type: types.NOTIFICATION_LIST_FAIL,
            payload: res.msg,
        });
    }

    return res;
  } catch (err) {
    console.error("Error fetching notifications:", err);
    dispatch({
        type: types.NOTIFICATION_LIST_FAIL,
        payload: err.response?.data?.msg
    });
  }
};