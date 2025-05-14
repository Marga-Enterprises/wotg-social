import React, { useEffect, useState, useRef } from 'react';

// Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPen,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

// CSS
import styles from './index.module.css';

// componenets
import EditPostModal from '../EditPostModal';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

const PostMenu = ({ postId, postAuthor, onClose, onClickOutside, onRefresh }) => {
  const menuRef = useRef(null);

  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (onClickOutside) onClickOutside();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClickOutside]);

  return (
    <div className={styles.menuContainer} ref={menuRef}>
      <div className={styles.menuItem} onClick={() => setShowEditPostModal(true)}>
        <FontAwesomeIcon icon={faPen} />
        <span>Edit post</span>
      </div>
      <div className={styles.menuItem} onClick={() => setShowDeleteModal(true)}>
        <FontAwesomeIcon icon={faTrash} />
        <span>Delete post</span>
      </div>
      <div className={styles.menuItem}>
        <FontAwesomeIcon icon={faUsers} />
        <span>Edit audience</span>
      </div>

      { showEditPostModal && (
        <EditPostModal 
          user={postAuthor}
          postId={postId}
          onClose={() => {
              setShowEditPostModal(false);
          }}
          onRefresh={onRefresh}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          postId={postId}
          onClose={() => {
            setShowDeleteModal(false)
            onClose();
          }}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};

export default React.memo(PostMenu);
