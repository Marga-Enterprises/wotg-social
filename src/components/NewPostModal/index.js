import React, { useMemo, useCallback, useState, useRef } from 'react';
import styles from './index.module.css';

// components
import LoadingSpinner from '../LoadingSpinner';
import DynamicSnackbar from '../DynamicSnackbar';

// subcomponents
import PostUploadArea from '../../subcomponents/PostUploadArea';

// redux
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

// fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTimes, 
    faUserTag,
    faImage,
 } from '@fortawesome/free-solid-svg-icons';

// utils
import { uploadFileToSpaces } from '../../utils/methods.js';

const NewPostModal = ({ user, onClose, onRefresh }) => {
    const dispatch = useDispatch();

    const loadingRef = useRef(false);

    const backendUrl = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images', []);

    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const [showUploadArea, setShowUploadArea] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});

    const handleSubmitPost = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        const uploadedFiles = [];

        try {
            if (files.length > 0) {
                for (const file of files) {
                    try {
                        const res = await dispatch(
                            wotgsocial.media.getPresignedUrlAction({
                                fileName: file.name,
                                fileType: file.type
                            })
                        );

                        const { url, fileName } = res.data;

                        await uploadFileToSpaces(file, url, (percent) => {
                            setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
                        });

                        const fileCategory = file.type.split('/')[0]; // "image", "video", "audio"

                        uploadedFiles.push({
                            url: fileName,
                            type: fileCategory
                        });
                    } catch (err) {
                        console.error('❌ Failed to upload:', file.name, err);
                    }
                }
            }

            console.log('🟢 Uploaded Files:', uploadedFiles);

            const payload = {
                content,
                files: uploadedFiles,
                visibility: 'public',
            };

            const postRes = await dispatch(wotgsocial.post.createPostAction(payload));

            if (postRes.success) {
                setSnackbar({ open: true, message: "Post created successfully", type: "success" });
                await Promise.resolve(onClose());
                await Promise.resolve(onRefresh(postRes.data));
            }

        } catch (error) {
            console.error('🚨 Error creating post:', error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [dispatch, content, files, onClose, onRefresh]);

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <DynamicSnackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            />
            <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                    <div className={styles.header}>
                        <span>Create post</span>
                        <button className={styles.closeButton}>
                            <FontAwesomeIcon icon={faTimes} onClick={onClose} />
                        </button>
                    </div>

                    <div className={styles.profileRow}>
                        <img src={user?.profileImage || `${backendUrl}/${user.user_profile_picture}`} alt="Profile" className={styles.avatar} />
                        <div className={styles.profileDetails}>
                            <span className={styles.name}>{user?.user_fname} {user?.user_lname}</span>
                            {/*<button className={styles.privacyBtn}>🌐 Public</button>*/}
                        </div>
                    </div>

                    <textarea
                        className={styles.textarea}
                        placeholder={`What's on your heart to share, ${user?.user_fname}?`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    { showUploadArea && (
                        <PostUploadArea 
                            onFilesChange={(files) => setFiles(files)} 
                            onClose={() => setShowUploadArea(false)}
                        />
                    )}

                    <div className={styles.actions}>
                        <span>Add to your post</span>
                        <div className={styles.icons}>
                            <button className={styles.iconButton}>
                                <FontAwesomeIcon onClick={() => setShowUploadArea(true)} icon={faImage} className={styles.imageIcon} />
                            </button>
                            <button className={styles.iconButton}>
                                <FontAwesomeIcon icon={faUserTag} className={styles.tagIcon} />
                            </button>
                        </div>
                    </div>

                    <button onClick={handleSubmitPost} className={styles.postButton}>Post</button>
                </div>
            </div>
        </>

    );
};

export default React.memo(NewPostModal);
