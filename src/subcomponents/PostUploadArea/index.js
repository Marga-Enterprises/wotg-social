import React, { useRef, useState, useEffect, useMemo } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faImage, faPlus } from '@fortawesome/free-solid-svg-icons';

const MAX_FILES = 3;

const PostUploadArea = ({ onFilesChange, onClose, filesFromPost, onFilesDelete }) => {
  const backendUrl = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images', []);
  const fileInputRef = useRef(null);

  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [selectedFilesToDelete, setSelectedFilesToDelete] = useState([]);

  const guessFileType = (file) => {
    if (!file) return 'unknown';

    // Check MIME type if available
    if (file.type && typeof file.type === 'string') {
      if (file.type.startsWith('image/')) return 'image';
      if (file.type.startsWith('video/')) return 'video';
      if (file.type.startsWith('audio/')) return 'audio';
    }

    // Fallback to file extension from URL
    if (file.url && typeof file.url === 'string') {
      const ext = file.url.split('.').pop().toLowerCase();

      const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      const videoExts = ['mp4', 'mov', 'webm'];
      const audioExts = ['mp3', 'wav', 'ogg'];

      if (imageExts.includes(ext)) return 'image';
      if (videoExts.includes(ext)) return 'video';
      if (audioExts.includes(ext)) return 'audio';
    }

    return 'unknown';
  };

  const handleFiles = (selectedFiles) => {
    const incoming = Array.from(selectedFiles);
  
    if (previews.length + incoming.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files.`);
      setTimeout(() => setError(''), 4000);
      return;
    }
  
    const previewItems = incoming.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: guessFileType(file),
    }));
  
    const updated = [...previews, ...previewItems];
    setPreviews(updated);
    onFilesChange?.(updated.map(p => p.file));
  
    // ✅ FIX: Reset input value to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };  

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (url, index) => {
    const fileName = url.replace(`${backendUrl}/`, '');
    const updated = [...previews];
    updated.splice(index, 1);
    setPreviews(updated);
    onFilesChange?.(updated.map(p => p.file));

    if (filesFromPost?.length > 0 && fileName) {
      const fileToDelete = filesFromPost.find(file => file.url === fileName);
      if (fileToDelete) {
        setSelectedFilesToDelete(prev => [...prev, fileToDelete.url]);
      }
    }
  };

  useEffect(() => {
    return () => previews.forEach(p => URL.revokeObjectURL(p.url));
  }, [previews]);

  useEffect(() => {
    if (filesFromPost?.length > 0) {
      const initialPreviews = filesFromPost.map((file) => (
        {
          file,
          url: `${backendUrl}/${file.url}`,
          type: guessFileType(file),
        }
      ));
      setPreviews(initialPreviews);
    }
  }, [filesFromPost]);

  useEffect(() => {
    if (selectedFilesToDelete) {
      onFilesDelete(selectedFilesToDelete);
    }
  }, [selectedFilesToDelete]);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.dragBox}
        onClick={() => fileInputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <button 
          className={styles.closeInside} 
          onClick={(e) => {
            e.stopPropagation(); // ✅ Prevent bubbling to dragBox
            onClose();
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {previews.length > 0 ? (
          <>
            <div className={styles.previewGrid}>
              {previews.map((p, index) => (
                <div key={index} className={styles.previewItem}>
                  {p.type === 'image' && (
                    <img src={p.url} alt={`preview-${index}`} className={styles.previewMedia} />
                  )}
                  {p.type === 'video' && (
                    <video src={p.url} controls className={styles.previewMedia} />
                  )}
                  {p.type === 'audio' && (
                    <audio src={p.url} controls className={styles.previewAudio} />
                  )}
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(p.url, index);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.previewOverlayButtons}>
              {/*<button><FontAwesomeIcon icon={faPen} /> Edit all</button>*/}
              {/*<button 
                onClick={() => {
                    if (fileInputRef.current) {
                        fileInputRef.current.value = ''; // Reset first
                        setTimeout(() => fileInputRef.current.click(), 0); // Then trigger
                    }
                }}
              >
                <FontAwesomeIcon icon={faImage} /> Add media
              </button>*/}
              <button><FontAwesomeIcon icon={faImage} /> Add Media</button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.centerIcon}>
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <p>Add photos, videos, or audio<br /><span>or drag and drop</span></p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default React.memo(PostUploadArea);
