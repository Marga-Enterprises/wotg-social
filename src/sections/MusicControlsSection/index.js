import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay, faVolumeUp, faStepForward, faStepBackward } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

const MusicControlsSection = ({ musicId, albumCover, onPrevious, onNext }) => {
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const clickListenerRef = useRef(null);
  const isSeekingRef = useRef(false); // ✅ Detect manual seeking

  const backendUrlImage = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images', []);
  const backendUrlAudio = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/audios', []);

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
    if (!audio || !music) return;

    const attemptPlay = () => {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          if (!clickListenerRef.current) {
            clickListenerRef.current = () => {
              audio.play().then(() => setIsPlaying(true));
              document.removeEventListener('click', clickListenerRef.current);
              clickListenerRef.current = null;
            };
            document.addEventListener('click', clickListenerRef.current, { once: true });
          }
        });
    };

    const handleLoadedMetadata = () => {
      audio.currentTime = 0;
      // setCurrentTime(0); // 🔥 Make sure UI resets
      setDuration(audio.duration || 0);
      attemptPlay();
    };    

    const handleTimeUpdate = () => {
      if (!isSeekingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };

    // Reset audio
    audio.pause();
    audio.removeAttribute('src');
    audio.load();

    // Assign new src
    audio.src = `${backendUrlAudio}/${music.audio_url}`;
    audio.load();

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    // MediaSession API setup
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: music.title,
        artist: music.artist_name,
        album: 'WOTG Streaming',
        artwork: [{ src: `${backendUrlImage}/${albumCover || 'default-cover.png'}`, sizes: '512x512', type: 'image/png' }]
      });
      navigator.mediaSession.setActionHandler('play', () => {
        audio.play().then(() => setIsPlaying(true));
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audio.pause();
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('previoustrack', onPrevious);
      navigator.mediaSession.setActionHandler('nexttrack', onNext);
    }

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      if (clickListenerRef.current) {
        document.removeEventListener('click', clickListenerRef.current);
        clickListenerRef.current = null;
      }
    };
  }, [music, backendUrlAudio, backendUrlImage, albumCover, onPrevious, onNext]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const handleSliderChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    if (!audioRef.current) return;

    isSeekingRef.current = true;
    audioRef.current.currentTime = value;
    setCurrentTime(value);

    setTimeout(() => {
      isSeekingRef.current = false;
    }, 300); // wait a bit before allowing timeupdate to take over
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
          alt={music.title}
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
        onEnded={() => {
          setTimeout(onNext, 1000); // Then after a slight delay go to next
          setCurrentTime(0);
        }}
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
