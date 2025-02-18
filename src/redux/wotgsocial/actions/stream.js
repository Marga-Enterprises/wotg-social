import {
  createTransport,
  connectTransport,
  startStream,
  consumeStream,
  stopStream,
  checkStreamStatus,
} from "../../../services/api/stream";
import * as types from "../types";

let isStartingStream = false;

// ✅ Start Stream Action (Broadcaster)
export const startStreamAction = (payload) => async (dispatch) => {
  try {
    dispatch({ type: types.START_STREAM_REQUEST });
    console.log('START STREAM TRIGGERED')
    const res = await startStream(payload);

    if (res.success) {
      
      dispatch({ type: types.START_STREAM_SUCCESS, payload: res.message });

      return res.message; 
    } else {
      dispatch({ type: types.START_STREAM_FAIL, payload: res.error || "Failed to start stream" });

      return null;
    }
  } catch (error) {
    dispatch({ type: types.START_STREAM_FAIL, payload: error.message });

    return null;
  }
};

// ✅ Create WebRTC Transport Action
export const createTransportAction = (payload) => async (dispatch) => {
  try {
    dispatch({ type: types.CREATE_TRANSPORT_REQUEST });

    const res = await createTransport(payload);

    if (res.success) {
      console.log('✅ PEILOAD RESPONSE:', res.data); // Debugging
      dispatch({ type: types.CREATE_TRANSPORT_SUCCESS, payload: res.data });

      return res.data; // ✅ RETURN the transport data
    } else {
      dispatch({ type: types.CREATE_TRANSPORT_FAIL, payload: res.error || "Failed to create transport" });
      return null; // ❌ Return `null` if transport creation fails
    }
  } catch (error) {
    dispatch({ type: types.CREATE_TRANSPORT_FAIL, payload: error.message });
    return null; // ❌ Handle API failure
  }
};


// ✅ Connect WebRTC Transport Action
export const connectTransportAction = (payload) => async (dispatch) => {
  try {
    dispatch({ type: types.CONNECT_TRANSPORT_REQUEST });

    const res = await connectTransport(payload);

    if (res.success) {
      dispatch({ type: types.CONNECT_TRANSPORT_SUCCESS, payload: res.message });

      return res.message;
    } else {
      dispatch({ type: types.CONNECT_TRANSPORT_FAIL, payload: res.error || "Failed to connect transport" });
    }
  } catch (error) {
    dispatch({ type: types.CONNECT_TRANSPORT_FAIL, payload: error.message });
  }
};

// ✅ Consume Stream Action (Viewer)
export const consumeStreamAction = (payload) => async (dispatch) => {
  try {
    console.log('🔍 PAYLOAD TO CONSUME:', payload);

    dispatch({ type: types.CONSUME_STREAM_REQUEST });

    const res = await consumeStream(payload);

    console.log('📡 SERVER RESPONSE:', res);

    if (res.success) {
      console.log('✅ STREAM CONSUMED SUCCESSFULLY:', res.data);
      
      dispatch({ type: types.CONSUME_STREAM_SUCCESS, payload: res.data });

      return res.data;
    } else {
      console.error('❌ CONSUME STREAM FAILED:', res.error || "Failed to consume stream");
      
      dispatch({ type: types.CONSUME_STREAM_FAIL, payload: res.error || "Failed to consume stream" });
    }
  } catch (error) {
    console.error('❌ ERROR IN CONSUME STREAM ACTION:', error.message, error.stack);
    
    dispatch({ type: types.CONSUME_STREAM_FAIL, payload: error.message });
  }
};


export const stopStreamAction = () => async (dispatch) => {
  try {
    dispatch({ type: types.STOP_STREAM_REQUEST });

    const res = await stopStream(); // Call API to stop the stream

    if (res.success) {
      dispatch({ type: types.STOP_STREAM_SUCCESS });
    } else {
      dispatch({ type: types.STOP_STREAM_FAIL, payload: res.error || "Failed to stop stream" });
    }
  } catch (error) {
    dispatch({ type: types.STOP_STREAM_FAIL, payload: error.message });
  }
};

export const checkStreamStatusAction = () => async (dispatch) => {
  try {
    dispatch({ type: types.CHECK_STREAM_STATUS_REQUEST });

    const res = await checkStreamStatus(); // ✅ Call the API directly

    if (res.success) {
      dispatch({ type: types.CHECK_STREAM_STATUS_SUCCESS, payload: res.data });
      return res.data; // ✅ Return isLive status directly
    } else {
      dispatch({ type: types.CHECK_STREAM_STATUS_FAIL, payload: "No active stream found." });
      return { isLive: false }; // ✅ Ensure it returns a boolean object
    }
  } catch (error) {
    dispatch({ type: types.CHECK_STREAM_STATUS_FAIL, payload: error.message });
    return { isLive: false }; // ✅ Handle errors safely
  }
};

