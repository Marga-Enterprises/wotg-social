import { getAllChatrooms,
    createChatroom   } from '../../../services/api/chatroom';

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
    return createChatroom(payload).then((res) => {
        if (res.success) {
          dispatch({
            type: types.CHATROOM_CREATE_SUCCESS,
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