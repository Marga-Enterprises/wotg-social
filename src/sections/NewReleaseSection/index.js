import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './index.module.css';

const NewReleaseSection = () => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const loadingRef = useRef(false);

  const backendUrl = useMemo(() =>
    'https://wotg.sgp1.cdn.digitaloceanspaces.com/images',
    []
  );

  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMusics = useCallback(async () => {
    if (loadingRef.current || musics.length > 0) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await dispatch(
        wotgsocial.music.getMusicByParamsAction({ pageSize: 10, pageIndex: 1 })
      );
      if (res.success && Array.isArray(res.data?.musics)) {
        setMusics(res.data.musics);
      }
    } catch (error) {
      console.error('❌ Failed to fetch musics:', error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [dispatch, musics.length]);

  useEffect(() => {
    fetchMusics();
  }, [fetchMusics]);

  const scrollFunction = (direction) => {
    // console.log('[[[[[[[[[[[ DIRECTION ]]]]]]]]]]]', direction);
    if (scrollRef.current) {
      const scrollAmount = 150;
      const scrollBy = direction === 'left' ? -scrollAmount : scrollAmount;
      scrollRef.current.scrollBy({ left: scrollBy, behavior: 'smooth' });
    }
  };  

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.musicScrollContainer}>
      <button className={styles.scrollButton} onClick={() => scrollFunction('left')}>
        &#10094;
      </button>

      <div className={styles.tableScrollWrapper} ref={scrollRef}>
        <table className={styles.musicTable}>
          <tbody>
            <tr>
              {musics.map((music) => (
                <td key={music.id} className={styles.musicTableCell}>
                  <div className={styles.musicCard}>
                    <img
                      src={`${backendUrl}/${music.cover_image || 'default-cover.png'}`}
                      alt={music.title}
                      className={styles.musicImage}
                      loading="lazy"
                    />
                    <div className={styles.musicText}>
                      <h3 className={styles.musicTitle}>{music.title}</h3>
                      <p className={styles.musicMeta}>{music.artist_name}</p>
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <button className={styles.scrollButton} onClick={() => scrollFunction('right')}>
        &#10095;
      </button>
    </div>
  );
};

export default React.memo(NewReleaseSection);
