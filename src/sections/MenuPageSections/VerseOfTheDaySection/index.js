import React, { useEffect } from 'react';
import styles from './index.module.css';
import { useSocket } from '../../../contexts/SocketContext';
import { Link } from 'react-router-dom';


// redux
import { useDispatch, useSelector } from 'react-redux';
import { wotgsocial } from '../../../redux/combineActions';

const VerseOfTheDaySection = () => {
  const socket = useSocket();
  const dispatch = useDispatch();

  const { videoId, loading, error } = useSelector((state) => state.wotgsocial.worship);
  const isLive = videoId && videoId !== 'defaultVideoID';

  useEffect(() => {
    dispatch(wotgsocial.worship.getWorshipServiceAction());
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;

    const handleLiveStream = ({ videoId }) => {
      console.log('📺 Received from socket:', videoId);
      dispatch(wotgsocial.worship.setWorshipStatusFromSocket(videoId));
    };

    const handleStreamStopped = () => {
      console.log('🛑 Stream stopped');
      dispatch(wotgsocial.worship.setWorshipStatusFromSocket('defaultVideoID'));
    };

    socket.on('online_streaming_is_active', handleLiveStream);
    socket.on('online_streaming_stopped', handleStreamStopped);

    return () => {
      socket.off('online_streaming_is_active', handleLiveStream);
      socket.off('online_streaming_stopped', handleStreamStopped);
    };
  }, [socket, dispatch]);

  return (
    <div className={styles.card}>
      <p className={styles.verseText}>
        "For God so loved the world that he gave his one and only Son, 
        that whoever believes in him shall not perish but have eternal life." 
        — <span className={styles.verseRef}>John 3:16</span>
      </p>

      {loading && <div className={styles.loading}>Checking worship status...</div>}
      {error && <div className={styles.error}>⚠ {error}</div>}

      {isLive && (
        <Link to="/worship" className={styles.liveStatus}>
          <span className={styles.dot}></span>
          <span className={styles.blink}>Live Worship Ongoing</span>
        </Link>
      )}
    </div>
  );
};

export default React.memo(VerseOfTheDaySection);
