import {
  stopStream,
  startStream,
  getRtpCapabilities,
  createProducerTransport,
  connectProducerTransport,
  produce,
  createConsumerTransport,
  connectConsumerTransport,
  consume,
} from '../../../services/api/stream';

// Types
import * as types from '../types';

// ✅ Start Stream Action
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

// ✅ Stop Stream Action
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

// ✅ Fetch WebRTC Capabilities Action
export const getRtpCapabilitiesAction = () => async (dispatch) => {
  try {
    dispatch({ type: types.GET_RTP_CAPABILITIES_REQUEST });

    const res = await getRtpCapabilities();

    if (res.success) {
      dispatch({ type: types.GET_RTP_CAPABILITIES_SUCCESS, payload: res.rtpCapabilities });
    } else {
      dispatch({ type: types.GET_RTP_CAPABILITIES_FAIL, payload: res.error || "Failed to fetch RTP capabilities" });
    }
  } catch (error) {
    dispatch({ type: types.GET_RTP_CAPABILITIES_FAIL, payload: error.message });
  }
};

// ✅ Create Producer Transport (Broadcaster)
export const createProducerTransportAction = () => async (dispatch) => {
  try {
    dispatch({ type: types.CREATE_PRODUCER_TRANSPORT_REQUEST });

    const res = await createProducerTransport();

    if (res.id) {
      dispatch({ type: types.CREATE_PRODUCER_TRANSPORT_SUCCESS, payload: res });
    } else {
      dispatch({ type: types.CREATE_PRODUCER_TRANSPORT_FAIL, payload: "Failed to create producer transport" });
    }
  } catch (error) {
    dispatch({ type: types.CREATE_PRODUCER_TRANSPORT_FAIL, payload: error.message });
  }
};

// ✅ Connect Producer Transport
export const connectProducerTransportAction = (transportId, dtlsParameters) => async (dispatch) => {
  try {
    dispatch({ type: types.CONNECT_PRODUCER_TRANSPORT_REQUEST });

    const res = await connectProducerTransport(transportId, dtlsParameters);

    if (res.success) {
      dispatch({ type: types.CONNECT_PRODUCER_TRANSPORT_SUCCESS });
    } else {
      dispatch({ type: types.CONNECT_PRODUCER_TRANSPORT_FAIL, payload: "Failed to connect producer transport" });
    }
  } catch (error) {
    dispatch({ type: types.CONNECT_PRODUCER_TRANSPORT_FAIL, payload: error.message });
  }
};

// ✅ Produce (Broadcaster starts sending media)
export const produceAction = (transportId, kind, rtpParameters) => async (dispatch) => {
  try {
    dispatch({ type: types.PRODUCE_REQUEST });

    const res = await produce(transportId, kind, rtpParameters);

    if (res.id) {
      dispatch({ type: types.PRODUCE_SUCCESS, payload: res });
    } else {
      dispatch({ type: types.PRODUCE_FAIL, payload: "Failed to produce media" });
    }
  } catch (error) {
    dispatch({ type: types.PRODUCE_FAIL, payload: error.message });
  }
};

// ✅ Create Consumer Transport (Viewer)
export const createConsumerTransportAction = () => async (dispatch) => {
  try {
    dispatch({ type: types.CREATE_CONSUMER_TRANSPORT_REQUEST });

    const res = await createConsumerTransport();

    if (res.id) {
      dispatch({ type: types.CREATE_CONSUMER_TRANSPORT_SUCCESS, payload: res });
    } else {
      dispatch({ type: types.CREATE_CONSUMER_TRANSPORT_FAIL, payload: "Failed to create consumer transport" });
    }
  } catch (error) {
    dispatch({ type: types.CREATE_CONSUMER_TRANSPORT_FAIL, payload: error.message });
  }
};

// ✅ Connect Consumer Transport (Viewer)
export const connectConsumerTransportAction = (transportId, dtlsParameters) => async (dispatch) => {
  try {
    dispatch({ type: types.CONNECT_CONSUMER_TRANSPORT_REQUEST });

    const res = await connectConsumerTransport(transportId, dtlsParameters);

    if (res.success) {
      dispatch({ type: types.CONNECT_CONSUMER_TRANSPORT_SUCCESS });
    } else {
      dispatch({ type: types.CONNECT_CONSUMER_TRANSPORT_FAIL, payload: "Failed to connect consumer transport" });
    }
  } catch (error) {
    dispatch({ type: types.CONNECT_CONSUMER_TRANSPORT_FAIL, payload: error.message });
  }
};

// ✅ Consume Stream (Viewer receives media)
export const consumeAction = (transportId, rtpCapabilities) => async (dispatch) => {
  try {
    dispatch({ type: types.CONSUME_REQUEST });

    const res = await consume(transportId, rtpCapabilities);

    if (res.id) {
      dispatch({ type: types.CONSUME_SUCCESS, payload: res });
    } else {
      dispatch({ type: types.CONSUME_FAIL, payload: "Failed to consume media" });
    }
  } catch (error) {
    dispatch({ type: types.CONSUME_FAIL, payload: error.message });
  }
};
