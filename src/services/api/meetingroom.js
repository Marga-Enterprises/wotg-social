// utils
import * as methods from '../../utils/methods';

import { GET, POST, PUT, DELETE } from '../request';

// Get all meeting rooms
export async function getAllMeetingRooms(payload) {
  return GET('/meetingrooms', payload); // Assuming the backend endpoint is /meetingrooms
}

// Create a new meeting room
export async function createMeetingRoom(payload) {
  return POST('/meetingrooms', payload); // Assuming the backend endpoint is /meetingrooms
}

// Join a meeting room
export async function joinMeetingRoom(payload) {
  return POST('/meetingrooms/join', payload); // Assuming the backend endpoint is /meetingrooms/join
}

// Leave a meeting room
export async function leaveMeetingRoom(payload) {
  return POST('/meetingrooms/leave', payload); // Assuming the backend endpoint is /meetingrooms/leave
}
