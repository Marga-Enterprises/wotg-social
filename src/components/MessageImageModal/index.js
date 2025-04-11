// components/MessageImageModal/index.jsx
import React from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const MessageImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose} aria-label="Close image viewer">
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <img
          src={imageUrl}
          alt="Full View"
          className={styles.fullImage}
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
};

export default React.memo(MessageImageModal);
