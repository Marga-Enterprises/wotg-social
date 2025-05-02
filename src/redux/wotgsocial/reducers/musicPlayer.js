import * as types from '../types';

const initialState = {
  trackList: [],
  currentTrack: null,
  isPlaying: false,
  volume: 1,
};

const musicPlayer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_TRACK_LIST:
      return {
        ...state,
        trackList: action.payload,
      };

    case types.SET_CURRENT_TRACK:
      return {
        ...state,
        currentTrack: action.payload,
      };

    case types.SET_IS_PLAYING:
      return {
        ...state,
        isPlaying: action.payload,
      };

    case types.SET_VOLUME:
      return {
        ...state,
        volume: action.payload,
      };

    case types.PLAY_NEXT_TRACK: {
      const index = state.trackList.findIndex(t => t.id === state.currentTrack?.id);
      const nextIndex = (index + 1) % state.trackList.length;
      return {
        ...state,
        currentTrack: state.trackList[nextIndex] || null,
      };
    }

    case types.PLAY_PREVIOUS_TRACK: {
      const index = state.trackList.findIndex(t => t.id === state.currentTrack?.id);
      const prevIndex = (index - 1 + state.trackList.length) % state.trackList.length;
      return {
        ...state,
        currentTrack: state.trackList[prevIndex] || null,
      };
    }

    default:
      return state;
  }
};

export default musicPlayer;
