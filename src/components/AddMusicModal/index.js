  import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
  import styles from "./index.module.css";

  import { useDispatch } from "react-redux";
  import { wotgsocial } from "../../redux/combineActions";

  import LoadingSpinner from "../../components/LoadingSpinner";

  const AddMusicModal = ({ isOpen, onClose, albumId }) => {
    const initialForm = useMemo(
      () => ({
        title: "",
        album_id: albumId,
        duration: "",
        track_number: "",
        is_explicit: "false",
        genre: "",
        file: null,
      }),
      []
    );

    const dispatch = useDispatch();
    const loadingRef = useRef(false); // ✅ Loading state reference

    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false); // ✅ Loading state
    const [audioPreview, setAudioPreview] = useState(null); // ✅ Preview URL

    const handleChange = useCallback((e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleFileChange = useCallback((e) => {
      const file = e.target.files[0];
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        setAudioPreview(objectUrl);
        setFormData((prev) => ({ ...prev, file }));
    
        // Get duration using audio element
        const tempAudio = document.createElement("audio");
        tempAudio.src = objectUrl;
        tempAudio.preload = "metadata";
        tempAudio.addEventListener("loadedmetadata", () => {
          const seconds = Math.floor(tempAudio.duration);
          setFormData((prev) => ({ ...prev, duration: seconds.toString() }));
          URL.revokeObjectURL(objectUrl); // Clean up object URL
        });
      }
    }, []);      

    const handleSubmit = useCallback(async (e) => {
      e.preventDefault();
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
    
      const payload = {
        title: formData.title,
        album_id: formData.album_id,
        duration: formData.duration,
        track_number: formData.track_number,
        is_explicit: formData.is_explicit,
        genre: formData.genre,
        file: formData.file,
      };
    
      try {
        const res = await dispatch(wotgsocial.music.createMusicAction(payload)); // 👈 update to your music action
        if (res.success) {
          onClose();
          setFormData(initialForm);
          setAudioPreview(null);
        } else {
          console.error("Error uploading music:", res.error);
        }
      } catch (error) {
        console.error("Error uploading music:", error);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    }, [dispatch, formData, initialForm, onClose]);    

    useEffect(() => {
      return () => {
        if (audioPreview) {
          URL.revokeObjectURL(audioPreview);
        }
      };
    }, [audioPreview]);    

    if (!isOpen) return null;

    return (
      <>
        { loading ? <LoadingSpinner /> : (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>Add Album</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <input
                  type="text"
                  name="title"
                  placeholder="Song Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                <input
                  type="number"
                  name="track_number"
                  placeholder="Track Number"
                  value={formData.track_number}
                  onChange={handleChange}
                  required
                />
                <select
                  name="is_explicit"
                  value={formData.is_explicit}
                  onChange={handleChange}
                >
                  <option value="false">Not Explicit</option>
                  <option value="true">Explicit</option>
                </select>
                <input
                  type="text"
                  name="genre"
                  placeholder="Genre"
                  value={formData.genre}
                  onChange={handleChange}
                />

                <label className={styles.fileLabel}>
                  Upload Audio File (mp3)
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                </label>

                {audioPreview && (
                  <div className={styles.previewContainer}>
                    <p className={styles.audioFilename}>{formData.file?.name}</p>
                    <audio controls src={audioPreview} className={styles.audioPreview} />
                  </div>
                )}

                <div className={styles.actions}>
                  <button type="button" onClick={onClose} className={styles.cancel}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submit}>
                    Upload Music
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

  export default React.memo(AddMusicModal);
