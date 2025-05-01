// react
import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react'

// redux
import { wotgsocial } from '../../redux/combineActions';
import { useDispatch } from 'react-redux';

// css
import styles from './index.module.css'

// components
import LoadingSpinner from '../../components/LoadingSpinner';

// font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';

const UpdatePlaylistModal = ({ playListDetails, onClose, onRefresh }) => {
    const dispatch = useDispatch();

    const initialForm = useMemo(
        () => ({
            name: playListDetails.name,
            description: playListDetails.description,
            file: null, // ✅ Image file
        }),
        []
    );
    const backendUrl = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images', []);

    const loadingRef = useRef(null);

    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(`${backendUrl}/${playListDetails?.cover_image || 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp'}`);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, file }));
            setImagePreview(URL.createObjectURL(file)); // ✅ Create preview
        }
    }, []);

    const handleSubmitUpdate = useCallback(async (e) => {
      e.preventDefault();

      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      const payload = {
        id: playListDetails.id,
        name: formData.name,
        description: formData.description,
        file: formData.file
      }

      try {
        const res = await dispatch(wotgsocial.playlist.updatePlaylistAction(payload));

        if (res.success) {
            onRefresh();
            onClose();
        };
      } catch (err) {
        console.error('Unable to update playlist: ', err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }

    }, [dispatch, formData, initialForm]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className={styles.overlay} onClick={(e) => {
            if (e.target === e.currentTarget) onClose(); // ✅ Close when clicking outside modal
        }}>
            <div className={styles.modal}>
                <div className={styles.heading}>
                    <h2 className={styles.title}>Edit details</h2>
                    <button
                        className={styles.customX}
                        onClick={onClose}
                        type="button"
                        aria-label="Close modal"
                    >
                        <FontAwesomeIcon icon={faTimes}/>
                    </button>
                </div>
                <form onSubmit={handleSubmitUpdate} className={styles.form}>
                    <div className={styles.formGrid}>
                    <div className={styles.imageWrapper}>
                        <label htmlFor="cover-upload" className={styles.imageOverlay}>
                        <img src={imagePreview} alt="Playlist Cover" className={styles.coverImage} />
                        <div className={styles.overlayContent}>
                            <span className={styles.icon}><FontAwesomeIcon icon={faEdit} /></span>
                            <span className={styles.text}>Choose photo</span>
                        </div>
                        </label>
                        <input
                        type="file"
                        id="cover-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className={styles.hiddenInput}
                        />
                    </div>

                    <div className={styles.inputFields}>
                        <div className={styles.formGroup}>
                        <label className={styles.label}>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={styles.input}
                        />
                        </div>

                        <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className={styles.textarea}
                        />
                        </div>
                    </div>
                    </div>

                    <p className={styles.note}>
                    By proceeding, you agree to give Spotify access to the image you choose to upload.
                    Please make sure you have the right to upload the image.
                    </p>

                    <div className={styles.actions}>
                    <button type="submit" className={styles.saveBtn}>Save</button>
                    </div>
                </form>
            </div>
        </div>
    );              
};

export default React.memo(UpdatePlaylistModal);