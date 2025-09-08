import * as types from '../types';

const initialState = {
  videoId: "defaultVideoID",
  success: false,
  loading: false,
  error: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    // Get latest worship
    case types.GET_LATEST_WORSHIP_REQUEST:
      return { ...state, loading: true, error: null };

    case types.GET_LATEST_WORSHIP_SUCCESS:
      return {
        ...state,
        loading: false,
        videoId: action.payload.videoId,
        success: true,
      };

    case types.GET_LATEST_WORSHIP_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Update latest worship
    case types.UPDATE_LATEST_WORSHIP_REQUEST:
      return { ...state, loading: true, error: null };

    case types.UPDATE_LATEST_WORSHIP_SUCCESS:
      return {
        ...state,
        loading: false,
        videoId: action.payload.videoId,
        success: true,
      };

    case types.UPDATE_LATEST_WORSHIP_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Reset
    case types.WORSHIP_RESET:
      return initialState;

    default:
      return state;
  }
};

export default reducer;
