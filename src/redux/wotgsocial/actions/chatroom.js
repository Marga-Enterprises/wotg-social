import { getAllChatrooms,
    createChatroom, addParticipantsInChatroom } from '../../../services/api/chatroom';

//types
import * as types from '../types';

export const getAllChatroomsAction = (payload) => async (dispatch) => {
  return getAllChatrooms(payload).then((res) => {
      if (res.success) {
        dispatch({
          type: types.CHATROOM_LIST_SUCCESS,
          payload: res.data, 
        });
      } else {
        dispatch({
          type: types.CHATROOM_LIST_FAIL,
          payload: res.msg,
        });
      }
  
      return res; 
    });
};



export const createChatroomAction = (payload) => async (dispatch) => {
  try {
    const res = await createChatroom(payload);
    const { success, data } = res;

    if (success) {
      dispatch({
        type: types.CHATROOM_CREATE_SUCCESS,
        payload: data,
      });
    }

    return res; // Return the response object in both success and error cases

  } catch (err) {
    return dispatch({
      type: types.CHATROOM_CREATE_FAIL,
      payload: err.response.data.msg,
    });
  }
};

export const addParticipantsInChatroomAction = (payload) => async (dispatch) => {
  try {
    const res = await addParticipantsInChatroom(payload);
    const { success, data } = res;

    if (success) {
      dispatch({
        type: types.ADD_PARTICIPANTS_SUCCESS,
        payload: data,
      });
    } else {
      dispatch({
        type: types.ADD_PARTICIPANTS_FAIL,
        payload: res.msg,
      });
    }

    return res;
  } catch (err) {
    return dispatch({
      type: types.ADD_PARTICIPANTS_FAIL,
      payload: err.response?.data?.msg || "Failed to add participants.",
    });
  }
};