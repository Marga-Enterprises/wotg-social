import * as types from '../types';

const initialState = {
  meetingrooms: [],
  error: null,
  loading: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch all meeting rooms
    case types.MEETINGROOM_LIST_REQUEST:
      return { ...state, loading: true };

    case types.MEETINGROOM_LIST_SUCCESS:
      return { ...state, loading: false, meetingrooms: action.payload };

    case types.MEETINGROOM_LIST_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Create a new meeting room
    case types.MEETINGROOM_CREATE_REQUEST:
      return { ...state, loading: true };

    case types.MEETINGROOM_CREATE_SUCCESS:
      return { ...state, loading: false, meetingrooms: [...state.meetingrooms, action.payload] };

    case types.MEETINGROOM_CREATE_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Join a meeting room
    case types.MEETINGROOM_JOIN_REQUEST:
      return { ...state, loading: true };

    case types.MEETINGROOM_JOIN_SUCCESS:
      return { ...state, loading: false };

    case types.MEETINGROOM_JOIN_FAIL:
      return { ...state, loading: false, error: action.payload };

    // Leave a meeting room
    case types.MEETINGROOM_LEAVE_REQUEST:
      return { ...state, loading: true };

    case types.MEETINGROOM_LEAVE_SUCCESS:
      return {
        ...state,
        loading: false,
        meetingrooms: state.meetingrooms.filter(
          (room) => room.name !== action.payload.name
        ), // Remove the participant from the room if needed
      };

    case types.MEETINGROOM_LEAVE_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default reducer;
