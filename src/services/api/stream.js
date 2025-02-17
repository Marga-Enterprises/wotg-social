// utils
import { POST, GET } from '../request'; // Import HTTP request functions

// ✅ Start Live Streaming
export async function startStream() {
  return POST('/stream/start'); // No payload needed
}

// ✅ Stop Live Streaming
export async function stopStream() {
  return POST('/stream/stop'); // No payload needed
}

// ✅ Get Mediasoup RTP Capabilities
export async function getRtpCapabilities() {
  return GET('/stream/rtpCapabilities'); // Fetch available video/audio formats
}

// ✅ Create Producer Transport (for Broadcaster)
export async function createProducerTransport() {
  return POST('/stream/createProducerTransport'); // No payload needed
}

// ✅ Connect Producer Transport (Broadcaster sends media)
export async function connectProducerTransport(transportId, dtlsParameters) {
  return POST('/stream/connectProducerTransport', { transportId, dtlsParameters });
}

// ✅ Produce Media (Broadcaster starts sending audio/video)
export async function produce(transportId, kind, rtpParameters) {
  return POST('/stream/produce', { transportId, kind, rtpParameters });
}

// ✅ Create Consumer Transport (for Viewer)
export async function createConsumerTransport() {
  return POST('/stream/createConsumerTransport'); // No payload needed
}

// ✅ Connect Consumer Transport (Viewer connects)
export async function connectConsumerTransport(transportId, dtlsParameters) {
  return POST('/stream/connectConsumerTransport', { transportId, dtlsParameters });
}

// ✅ Consume Stream (Viewer receives audio/video)
export async function consume(transportId, rtpCapabilities) {
  return POST('/stream/consume', { transportId, rtpCapabilities });
}
