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


/*
export const createChatroomAction = (payload) => async (dispatch) => {
    return createChatroom(payload).then((res) => {
        console.log('Error creating chatroom:', res);
        if (res.success) {
          dispatch({
            type: types.CHATROOM_CREATE_SUCCESS,
            payload: res.data.docs,
          });
        } else {
          //console.log('Error creating chatroom:', res);
          dispatch({
            type: types.CHATROOM_CREATE_FAIL,
            payload: res.msg,
          });
        }
    
        return res;
      });
};
*/

export const createChatroomAction = (payload) => async (dispatch) => {
  try {
    const res = await createChatroom(payload);
    const { success, data } = res;

    console.log('RESPONSEEEE SA REDUX', res);

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