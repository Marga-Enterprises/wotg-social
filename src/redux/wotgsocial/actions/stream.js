import { stopStream, startStream } from '../../../services/api/stream';

// Types
import * as types from '../types';

// Start Stream Action
export const startStreamAction = () => async (dispatch) => {
  try {
    dispatch({ type: types.START_STREAM_REQUEST });

    const res = await startStream();
    
    if (res.success) {
      dispatch({ type: types.START_STREAM_SUCCESS, payload: res.message });
    } else {
      dispatch({ type: types.START_STREAM_FAIL, payload: res.error || "Failed to start stream" });
    }
  } catch (error) {
    dispatch({ type: types.START_STREAM_FAIL, payload: error.message });
  }
};

// Stop Stream Action
export const stopStreamAction = () => async (dispatch) => {
  try {
    dispatch({ type: types.STOP_STREAM_REQUEST });

    const res = await stopStream();
    
    if (res.success) {
      dispatch({ type: types.STOP_STREAM_SUCCESS, payload: res.message });
    } else {
      dispatch({ type: types.STOP_STREAM_FAIL, payload: res.error || "Failed to stop stream" });
    }
  } catch (error) {
    dispatch({ type: types.STOP_STREAM_FAIL, payload: error.message });
  }
};
