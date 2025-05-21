// redux/wotgsocial/actions/musicPlayer.js
import * as types from '../types';

export const setTrackList = (tracks) => ({
  type: types.SET_TRACK_LIST,
  payload: tracks,
});

export const setCurrentTrack = (track) => {
  if (window.flutter_inappwebview) {
    try {
      window.flutter_inappwebview.callHandler("playAudio", {
        title: `${track.title} - ${track.artist_name}`,
        artist: track.artist_name,
        cover: `https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${track.album_title}`,
        url: `https://wotg.sgp1.cdn.digitaloceanspaces.com/audios/${track.audio_url}`,
      });
    } catch (error) {
      console.error("❌ Failed to send track to Flutter:", error);
    }
  }

  return {
    type: types.SET_CURRENT_TRACK,
    payload: track,
  };
};

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
