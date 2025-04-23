import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPause,
  faPlay,
  faVolumeUp,
  faStepForward ,
  faStepBackward
} from '@fortawesome/free-solid-svg-icons';

import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

const MusicControlsSection = ({ 
    musicId, 
    albumCover,
    onPrevious, 
    onNext
 }) => {    
  const dispatch = useDispatch();
  const audioRef = useRef(null);

  const backendUrl = useMemo(() => (
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : 'https://community.wotgonline.com/api'
  ), []);

  const [music, setMusic] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const fetchMusic = useCallback(async () => {
    if (!musicId) return;
    const res = await dispatch(wotgsocial.music.getMusicByIdAction({ id: musicId }));
    if (res.success) setMusic(res.data);
  }, [dispatch, musicId]);

  useEffect(() => {
    fetchMusic();
  }, [fetchMusic]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!music || !audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setCurrentTime(0);
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.warn('Autoplay blocked:', err));
    };

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);

    audio.src = `${backendUrl}/uploads/${music.audio_url}`;
    audio.load();
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [music, backendUrl]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSliderChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  }, []);

  const handleVolumeChange = useCallback((e) => {
    if (audioRef.current) {
      audioRef.current.volume = parseFloat(e.target.value);
    }
  }, []);

  if (!music) return null;

  return (
    <div className={styles.musicControlsSection}>
      <div className={styles.songInfo} onClick={togglePlay} style={{ cursor: 'pointer' }}>
        <img
          src={`${backendUrl}/uploads/${albumCover || 'default-cover.png'}`}
          alt="Album Art"
          className={styles.albumThumb}
        />
        <div>
          <p className={styles.songTitle}>{music.title}</p>
          <p className={styles.songArtist}>{music.artist_name}</p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.icons}>
            <FontAwesomeIcon icon={faStepBackward} className={styles.icon} onClick={onPrevious} />
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={styles.icon} onClick={togglePlay} />
            <FontAwesomeIcon icon={faStepForward } className={styles.icon} onClick={onNext} />
        </div>
        <div className={styles.progress}>
          <span className={styles.time}>{formatDuration(currentTime)}</span>
          <input
            type="range"
            className={styles.slider}
            min="0"
            max={duration || 1}
            value={currentTime}
            onChange={handleSliderChange}
          />
          <span className={styles.time}>{formatDuration(duration)}</span>
        </div>
      </div>

      <div className={styles.volume}>
        <FontAwesomeIcon icon={faVolumeUp} className={styles.icon} />
        <input
          type="range"
          className={styles.volumeSlider}
          onChange={handleVolumeChange}
          step="0.01"
          min="0"
          max="1"
          defaultValue="1"
        />
      </div>

      <audio
        ref={audioRef}
        preload="metadata"
        onEnded={() => setTimeout(() => {
            onNext();
        }, 2000)}
      />
    </div>
  );
};

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default React.memo(MusicControlsSection);
