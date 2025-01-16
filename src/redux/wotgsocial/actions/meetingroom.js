import { accessMeetingroom } from '../../../services/api/meetingroom';

import * as types from '../types';

export const accessMeetingroomAction = (payload) => async (dispatch) => {
  return accessMeetingroom(payload).then((res) => {
    if (res.success) {
      dispatch({
        type: types.MEETINGROOM_ACCESS_SUCCESS,
        payload: res.data,
      });
    } else {
      dispatch({
        type: types.MEETINGROOM_ACCESS_FAIL,
        payload: res.msg,
      });
    }

    return res;
  });
};