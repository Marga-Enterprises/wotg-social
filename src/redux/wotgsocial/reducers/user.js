import * as types from '../types';

const initialState = {
  authenticated: false,
  error: null,
  user: {},
};

const reducer = (state = initialState, action) => {
  switch(action.type){
    case types.LOGIN_REQUEST:
      return { loading: true };

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

    default:
      return state;
  }
}


export default reducer;