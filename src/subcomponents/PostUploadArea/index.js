import React, { useRef, useState, useEffect, useMemo } from 'react';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPen, faImage } from '@fortawesome/free-solid-svg-icons';

const MAX_FILES = 3;

const PostUploadArea = ({ onFilesChange, onClose, filesFromPost, onFilesDelete }) => {
    const backendUrl = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images', []);

    const fileInputRef = useRef(null);

    const [previews, setPreviews] = useState([]);
    const [error, setError] = useState('');
    const [selectedFilesToDelete, setSelectedFilesToDelete] = useState('');

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

    const removeFile = (url, index) => {
        const fileName = url.replace('https://wotg.sgp1.cdn.digitaloceanspaces.com/images/', '');
        const updated = [...previews];
        updated.splice(index, 1);
        setPreviews(updated);
        onFilesChange?.(updated.map(p => p.file));

        if (filesFromPost?.length > 0) {
            if (fileName) {
                // no space in the string
                setSelectedFilesToDelete((prev) => prev ? `${prev},${fileName}` : fileName);
            }
        }
    };

    useEffect(() => {
        return () => previews.forEach(p => URL.revokeObjectURL(p.url));
    }, [previews]);

    useEffect(() => {
        if (filesFromPost?.length > 0) {
            const initialPreviews = filesFromPost.map((file) => ({
                file,
                url: `${backendUrl}/${file.url}`,
            }));
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
                                        removeFile(p.url, index);
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
