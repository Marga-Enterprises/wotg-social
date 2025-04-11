import React, { useCallback } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDownload } from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';

const MessageImageModal = ({ imageUrl, onClose }) => {
  // Move useCallback before any return
  const handleDownload = useCallback(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const baseName = imageUrl.split('/').pop()?.split('.')[0] || 'image';
            const filename = `${baseName}.jpg`;
            saveAs(blob, filename);
          }
        },
        'image/jpeg',
        0.7
      );
    };

    img.onerror = () => {
      console.warn('❌ Failed to load image for download.');
    };
  }, [imageUrl]);

  // After all hooks
  if (!imageUrl) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close image viewer">
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <button className={styles.downloadButton} onClick={handleDownload} aria-label="Download image">
          <FontAwesomeIcon icon={faDownload} />
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
