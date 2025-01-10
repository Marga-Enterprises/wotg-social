import { getAllMeetingRooms, createMeetingRoom, joinMeetingRoom, leaveMeetingRoom } from '../../../services/api/meetingroom';

// Types
import * as types from '../types';

// Get all meeting rooms
export const getAllMeetingRoomsAction = (payload) => async (dispatch) => {
  return getAllMeetingRooms(payload).then((res) => {
    if (res.success) {
      dispatch({
        type: types.MEETINGROOM_LIST_SUCCESS,
        payload: res.data,
      });
    } else {
      dispatch({
        type: types.MEETINGROOM_LIST_FAIL,
        payload: res.msg,
      });
    }

    return res;
  });
};

// Create a new meeting room
export const createMeetingRoomAction = (payload) => async (dispatch) => {
  return createMeetingRoom(payload).then((res) => {
    if (res.success) {
      dispatch({
        type: types.MEETINGROOM_CREATE_SUCCESS,
        payload: res.data,
      });
    } else {
      dispatch({
        type: types.MEETINGROOM_CREATE_FAIL,
        payload: res.msg,
      });
    }

    return res;
  });
};

// Join a meeting room and launch Jitsi
export const joinMeetingRoomAction = (payload) => async (dispatch) => {
  return joinMeetingRoom(payload).then((res) => {
    if (res.success) {
      dispatch({
        type: types.MEETINGROOM_JOIN_SUCCESS,
        payload: res.data,
      });

      // Trigger the function to launch the Jitsi meeting after joining the room
      launchJitsiMeeting(res.data.roomName); // Initialize Jitsi with the room name

    } else {
      dispatch({
        type: types.MEETINGROOM_JOIN_FAIL,
        payload: res.msg,
      });
    }

    return res;
  });
};

// Leave a meeting room
export const leaveMeetingRoomAction = (payload) => async (dispatch) => {
  return leaveMeetingRoom(payload).then((res) => {
    if (res.success) {
      dispatch({
        type: types.MEETINGROOM_LEAVE_SUCCESS,
        payload: res.data,
      });
    } else {
      dispatch({
        type: types.MEETINGROOM_LEAVE_FAIL,
        payload: res.msg,
      });
    }

    return res;
  });
};

// Function to launch Jitsi Meet in the frontend
export const launchJitsiMeeting = (roomName) => {
  const domain = 'meet.jit.si'; // Jitsi public server, replace if you have your own server
  const options = {
    roomName: roomName,
    width: '100%',
    height: '100%',
    parentNode: document.getElementById('jitsi-meet-container'),
  };

  const api = new window.JitsiMeetExternalAPI(domain, options);

  // You can handle additional events from Jitsi API here (e.g., meeting ended, participant joined)
  api.addEventListener('videoConferenceJoined', () => {
    console.log('Successfully joined the meeting!');
  });

  // You can return the API instance if you need to interact with it later (optional)
  return api;
};
