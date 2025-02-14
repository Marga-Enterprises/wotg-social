// utils
import { POST } from '../request'; // Import your HTTP methods

// Start Live Streaming
export async function startStream() {
  return POST('/stream/start'); // No payload needed
}

// Stop Live Streaming
export async function stopStream() {
  return POST('/stream/stop'); // No payload needed
}
