import * as types from '../types';

const initialState = {
  loading: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {

    case types.SET_LOADING:
      return { ...state, loading: true };

    case types.CLEAR_LOADING:
      return { ...state, loading: false };

    default:
      return state;
  }
};

export default reducer;