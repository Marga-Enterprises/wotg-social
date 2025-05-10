import React, { useRef, useState, useEffect } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPen, faImage } from '@fortawesome/free-solid-svg-icons';


const MAX_FILES = 3;

const PostUploadArea = ({ onFilesChange, onClose }) => {
    const fileInputRef = useRef(null);
    const [previews, setPreviews] = useState([]);
    const [error, setError] = useState('');


    const handleFiles = (selectedFiles) => {
        const incoming = Array.from(selectedFiles);
    
        if (previews.length + incoming.length > MAX_FILES) {
            setError(`You can only upload up to ${MAX_FILES} files.`);
            setTimeout(() => setError(''), 4000); // Clear after 4s
            return;
        }
    
        const previewUrls = incoming.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
    
        const updated = [...previews, ...previewUrls];
        setPreviews(updated);
        onFilesChange?.(updated.map(p => p.file));
    };    

    const handleDrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const removeFile = (index) => {
        const updated = [...previews];
        updated.splice(index, 1);
        setPreviews(updated);
        onFilesChange?.(updated.map(p => p.file));
    };

    useEffect(() => {
        return () => previews.forEach(p => URL.revokeObjectURL(p.url));
    }, [previews]);

    return (
        <div className={styles.wrapper}>
            <div
                className={styles.dragBox}
                onClick={() => fileInputRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <button className={styles.closeInside} onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                {previews.length > 0 ? (
                    <>
                        <div className={styles.previewGrid}>
                            {previews.map((p, index) => (
                                <div key={index} className={styles.previewItem}>
                                    <img src={p.url} alt={`preview-${index}`} className={styles.previewImage} />
                                    <button className={styles.removeBtn} onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}>×</button>
                                </div>
                            ))}
                        </div>
                        <div className={styles.previewOverlayButtons}>
                            <button><FontAwesomeIcon icon={faPen} /> Edit all</button>
                            <button onClick={() => fileInputRef.current.click()}>
                                <FontAwesomeIcon icon={faImage} /> Add photos/videos
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.centerIcon}>➕</div>
                        <p>Add photos/videos<br /><span>or drag and drop</span></p>
                    </>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
    );
};

export default React.memo(PostUploadArea);
