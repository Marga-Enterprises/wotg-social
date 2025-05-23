import React, { useMemo, useEffect, useCallback, useState, useRef } from 'react';
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

const EditPostModal = ({ user, onClose, onRefresh, postId }) => {
    const dispatch = useDispatch();

    const loadingRef = useRef(false);

    const backendUrl = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images', []);

    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const [showUploadArea, setShowUploadArea] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });
    const [files, setFiles] = useState([]);
    const [filesToDeleteArray, setFilesToDeleteArray] = useState('');
    const [filesFromPost, setFilesFromPost] = useState([]);

    const handleFetchPost = useCallback(() => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        dispatch(wotgsocial.post.getPostByIdAction({ id: postId })).then((res) => {
            if (res?.success) {
                setContent(res.data.content);
                setFilesFromPost(res.data.media || []);

                if (res.data.media?.length > 0) {
                    setShowUploadArea(true);
                }
            }
        }).finally(() => {
            loadingRef.current = false;
            setLoading(false);
        });

    }, [dispatch, postId]);
    
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
                            // Optional: Track progress if needed
                            console.log(`Upload progress for ${file.name}: ${percent}%`);
                        });

                        const fileCategory = file.type.split('/')[0]; // "image", "video", "audio"

                        uploadedFiles.push({
                            url: fileName, // same as in NewPostModal
                            type: fileCategory
                        });
                    } catch (err) {
                        console.error('❌ Failed to upload:', file.name, err);
                    }
                }
            }

            const payload = {
                id: postId,
                content,
                files: uploadedFiles,
                visibility: 'public',
                filesToDelete: filesToDeleteArray // assumed to be an array of filenames/keys
            };

            const res = await dispatch(wotgsocial.post.updatePostAction(payload));

            if (res.success) {
                setSnackbar({ open: true, message: 'Post updated successfully!', type: 'success' });

                await Promise.resolve(onClose());
                await Promise.resolve(onRefresh(res.data));
            }

        } catch (error) {
            console.error('Error updating post:', error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [dispatch, content, files, filesToDeleteArray, postId, onClose, onRefresh]);

    useEffect(() => {
        handleFetchPost();
    }, [handleFetchPost]);

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
                        <span>Edit post</span>
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
                            filesFromPost={filesFromPost}
                            onFilesDelete={(files) => {
                                setFilesToDeleteArray(files);
                            }}
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

export default React.memo(EditPostModal);
