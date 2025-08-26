import { getMessagesByChatroom, sendMessage, sendAutomatedMessage, reactToMessage, sendFile, sendBotReply  } from '../../../services/api/message';

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
        payload: res.data,
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

// Send Automated Message
export const sendAutomatedMessageAction = (payload) => async (dispatch) => {
  return sendAutomatedMessage(payload).then((res) => {
    if (res.success) {
      dispatch({
        type: types.MESSAGE_CREATE_SUCCESS,
        payload: res.data,
      });
    } else {
      dispatch({
        type: types.MESSAGE_CREATE_FAIL,
        payload: res.msg,
      });
    }

    return res;
  });
}

// Send Bot Reply
export const sendBotReplyAction = (payload) => async (dispatch) => {
  return sendBotReply(payload).then((res) => {
    if (res.success) {
      dispatch({
        type: types.MESSAGE_CREATE_SUCCESS, // ✅ Reuse same reducer type
        payload: res.data, // Bot replies return a single message
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

export const sendFileMessageAction = (payload) => async (dispatch) => {
  return sendFile(payload).then((res) => {
    if (res.success) {
      dispatch({
        type: types.MESSAGE_CREATE_SUCCESS, // ✅ Reuse same reducer type
        payload: res.data, // File messages return a single message
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
