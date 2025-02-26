// utils
import { GET, POST } from '../request'; // Import your HTTP methods

// Fetch messages by chatroom ID
export async function getMessagesByChatroom(chatroomId, payload = {}) {
  return GET(`/messages/${chatroomId}`, payload); // Adjusted to include `chatroomId` for better routing
}

// Send a new message
export async function sendMessage(payload) {
  return POST('/messages', payload); // Payload should include content, senderId, and chatroomId
}

export async function reactToMessage(payload) {
  return POST('/messages/react', payload); // Payload should include messageId, userId, and react
}