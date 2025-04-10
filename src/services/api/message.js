// utils
import { GET, POST, POST_FORM_DATA } from '../request'; // Import your HTTP methods

// Fetch messages by chatroom ID
export async function getMessagesByChatroom(chatroomId, payload = {}) {
  return GET(`/messages/${chatroomId}`, payload); // Adjusted to include `chatroomId` for better routing
}

// Send a new message
export async function sendMessage(payload) {
  return POST('/messages/send-text', payload); // Payload should include content, senderId, and chatroomId
}

export async function reactToMessage(payload) {
  return POST('/messages/react', payload); // Payload should include messageId, userId, and react
}

export async function sendFile(payload) {
  const formData = new FormData();

  for (const key in payload) {
    if (payload[key] !== null && payload[key] !== undefined) {
      formData.append(key, payload[key]);
    }
  }

  // 🔍 Log FormData entries
  console.log('[[[[[[[Sending file:]]]]]]]');
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}:`, pair[1]);
  }

  return POST_FORM_DATA('/messages/send-file', { formData });
}
