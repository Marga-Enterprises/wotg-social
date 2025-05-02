// redux/wotgsocial/actions/musicPlayer.js
import * as types from '../types';

export const setTrackList = (tracks) => ({
  type: types.SET_TRACK_LIST,
  payload: tracks,
});

export const setCurrentTrack = (track) => ({
  type: types.SET_CURRENT_TRACK,
  payload: track,
});

export const setIsPlaying = (isPlaying) => ({
  type: types.SET_IS_PLAYING,
  payload: isPlaying,
});

export const setVolume = (volume) => ({
  type: types.SET_VOLUME,
  payload: volume,
});

export const playNextTrack = () => ({
  type: types.PLAY_NEXT_TRACK,
});

export const playPreviousTrack = () => ({
  type: types.PLAY_PREVIOUS_TRACK,
});
