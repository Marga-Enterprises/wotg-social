// utils
import { POST, GET } from "../request"; // Import HTTP request functions

// ✅ Create WebRTC Transport
export async function createTransport(payload) {
  return POST("/stream/create-transport", payload);
}

// ✅ Connect WebRTC Transport
export async function connectTransport(payload) {
  return POST("/stream/connect-transport", payload);
}

// ✅ Start Live Streaming (Broadcaster sends video/audio)
export async function startStream(payload) {
  return POST("/stream/produce", payload);
}

// ✅ Watch Live Stream (Viewer receives video/audio)
export async function consumeStream(payload) {
  return POST("/stream/consume", payload);
}

// ✅ Stop Live Streaming (Broadcaster stops streaming)
export async function stopStream() {
  return POST("/stream/stop");
}

// ✅ Check if a live stream is active (Viewer auto-detect)
export async function checkStreamStatus() {
  return GET("/stream/status");
}
