import * as types from '../types';

const initialState = {
  authenticated: false,
  error: null,
  user: {},
  users: [], // This is where we'll store the list of users
  loading: false, // This will be used to track loading state for the users fetch
};

const reducer = (state = initialState, action) => {
  switch(action.type) {
    case types.LOGIN_REQUEST:
      return { ...state, loading: true };

    case types.LOGIN_SUCCESS:
      return { ...state, loading: false, user: action.payload };

    case types.SET_USER_DETAILS:
      return { ...state, ...action.payload, authenticated: true };

    case types.LOGIN_FAIL:
      return { ...state, loading: false, error: action.payload };

    case types.USER_ADD_SUCCESS:
      return { ...state, loading: false, user: action.payload };

    case types.USER_ADD_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Handling the user list actions
    case types.USER_LIST_REQUEST:
      return { ...state, loading: true };

    case types.USER_LIST_SUCCESS:
      return { ...state, loading: false, users: action.payload };

    case types.USER_LIST_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

export default reducer;
