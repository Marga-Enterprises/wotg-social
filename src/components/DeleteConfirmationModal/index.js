// react
import React, { useCallback, useRef, useState } from 'react';

// redux
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

// css
import styles from './index.module.css';

// loadingSpinner
import LoadingSpinner from '../LoadingSpinner';

const DeleteConfirmationModal = ({ postId, onClose, onRefresh }) => {
  const dispatch = useDispatch();

  const loadingRef = useRef(false);

  const [loading, setLoading] = useState(false);

  const handleDeletePost = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    dispatch(wotgsocial.post.deletePostAction({ id: postId })).then((res) => {
      if (res?.success) {
        onRefresh();
        onClose();
      }
    }).finally(() => {
      loadingRef.current = false;
      setLoading(false);
    })
  }, [dispatch, postId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        <h3 className={styles.modalTitle}>Delete post?</h3>
        <p className={styles.modalText}>
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.confirmBtn} onClick={handleDeletePost}>Move</button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DeleteConfirmationModal);
