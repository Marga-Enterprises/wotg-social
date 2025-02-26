import { getMessagesByChatroom, sendMessage, reactToMessage } from '../../../services/api/message';

// Types
import * as types from '../types';

// Fetch Messages by Chatroom
export const getMessagesByChatroomAction = (chatroomId, payload) => async (dispatch) => {
  return getMessagesByChatroom(chatroomId, payload).then((res) => {
    if (res.success) {
      dispatch({
        type: types.MESSAGE_LIST_SUCCESS,
        payload: res.data,
      });
    } else {
      dispatch({
        type: types.MESSAGE_LIST_FAIL,
        payload: res.msg,
      });
    }

    return res;
  });
};

// Send Message
export const sendMessageAction = (payload) => async (dispatch) => {
  return sendMessage(payload).then((res) => {
    if (res.success) {
      dispatch({
        type: types.MESSAGE_CREATE_SUCCESS,
        payload: res.data.docs,
      });
    } else {
      dispatch({
        type: types.MESSAGE_CREATE_FAIL,
        payload: res.msg,
      });
    }

    return res;
  });
};

// React to Message
export const reactToMessageAction = (payload) => async (dispatch) => {
  return reactToMessage(payload).then((res) => {
    if (res.success) {
      dispatch({
        type: types.REACT_TO_MESSAGE_SUCCESS,
        payload: res.data,
      });
    } else {
      dispatch({
        type: types.REACT_TO_MESSAGE_FAIL,
        payload: res.msg,
      });
    }

    return res;
  });
};
