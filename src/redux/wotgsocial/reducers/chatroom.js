import * as types from '../types';

const initialState = {
  chatrooms: [],
  error: null,
  loading: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.CHATROOM_LIST_REQUEST:
      return { ...state, loading: true };

    case types.CHATROOM_LIST_SUCCESS:
      return { ...state, loading: false, chatrooms: action.payload };

    case types.CHATROOM_LIST_FAIL:
      return { ...state, loading: false, error: action.payload };

    case types.CHATROOM_CREATE_REQUEST:
      return { ...state, loading: true };

    case types.CHATROOM_CREATE_SUCCESS:
      return { ...state, loading: false, chatrooms: [...state.chatrooms, action.payload] };

    case types.CHATROOM_CREATE_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default reducer;
