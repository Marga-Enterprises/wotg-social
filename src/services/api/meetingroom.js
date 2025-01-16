
import { POST } from '../request';

// Get all meeting rooms
export async function accessMeetingroom(payload) {
  return POST('/meetingrooms/access', payload);
}

