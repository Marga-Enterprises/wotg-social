import * as types from '../types';

const initialState = {
  messages: [],
  error: null,
  loading: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.MESSAGE_LIST_REQUEST:
      return { ...state, loading: true };

    case types.MESSAGE_LIST_SUCCESS:
      return { ...state, loading: false, messages: action.payload };

    case types.MESSAGE_LIST_FAIL:
      return { ...state, loading: false, error: action.payload };

    case types.MESSAGE_CREATE_REQUEST:
      return { ...state, loading: true };

    case types.MESSAGE_CREATE_SUCCESS:
      return { ...state, loading: false, messages: [...state.messages, action.payload] };

    case types.MESSAGE_CREATE_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default reducer;
