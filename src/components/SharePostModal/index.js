import React, { useMemo, useCallback, useState, useRef } from 'react';
import styles from './index.module.css';

// components
import LoadingSpinner from '../LoadingSpinner';
import DynamicSnackbar from '../DynamicSnackbar';

// subsections
import PostCard from '../../subsections/feeds/PostCard';

// redux
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';

// fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTimes, 
    faUserTag,
} from '@fortawesome/free-solid-svg-icons';

const SharePostModal = ({ user, onClose, onRefresh, post, socket }) => {
    const dispatch = useDispatch();

    const loadingRef = useRef(false);

    const backendUrl = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images', []);

    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

    const handleSubmitPost = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        try {
            const payload = {
                postId: post.id,
                content,
                visibility: 'public',
            };

            const res = await dispatch(wotgsocial.post.sharePostByIdAction(payload));

            if (res.success) {
                setSnackbar({ open: true, message: 'Post created successfully!', type: 'success' });
                await Promise.resolve(onClose());
                await Promise.resolve(onRefresh(res.data));
            }
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [dispatch, content]);

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
                        </div>
                    </div>

                    <textarea
                        className={styles.textarea}
                        placeholder={`What's on your heart to share, ${user?.user_fname}?`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {post && (
                        <div className={styles.postPreview}>
                            <PostCard
                                post={post}
                                user={user}
                                userId={user?.user_id}
                                socket={socket}
                                showSummaryAndActions={false}
                            />
                        </div>
                    )}

                    <div className={styles.actions}>
                        <span>Add to your post</span>
                        <div className={styles.icons}>
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

export default React.memo(SharePostModal);
