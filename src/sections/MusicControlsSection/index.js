import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPause,
  faPlay,
  faVolumeUp,
  faStepForward,
  faStepBackward
} from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

const MusicControlsSection = ({ musicId, albumCover, onPrevious, onNext }) => {
  const dispatch = useDispatch();
  const audioRef = useRef(null);

  const backendUrlImage = useMemo(() =>
    'https://wotg.sgp1.cdn.digitaloceanspaces.com/images',
  []);

  const backendUrlAudio= useMemo(() =>
    'https://wotg.sgp1.cdn.digitaloceanspaces.com/audios',
    []
  );

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

    let metadataHandler, timeUpdateHandler;

    const setupAudio = () => {
      metadataHandler = () => {
        setDuration(audio.duration);
        setCurrentTime(0);
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.warn('Autoplay blocked:', err));
      };

      timeUpdateHandler = () => setCurrentTime(audio.currentTime);

      audio.addEventListener('loadedmetadata', metadataHandler);
      audio.addEventListener('timeupdate', timeUpdateHandler);
      audio.src = `${backendUrlAudio}/${music.audio_url}`;
      audio.load();
    };

    setupAudio();

    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('loadedmetadata', metadataHandler);
        audio.removeEventListener('timeupdate', timeUpdateHandler);
      }
    };
  }, [music, backendUrlAudio]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true));
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
          src={`${backendUrlImage}/${albumCover || 'default-cover.png'}`}
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
          <FontAwesomeIcon icon={faStepForward} className={styles.icon} onClick={onNext} />
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
        onEnded={() => setTimeout(onNext, 1000)}
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
