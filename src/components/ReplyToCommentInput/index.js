import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './index.module.css';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../redux/combineActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImage,
  faPaperPlane,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import Cookie from 'js-cookie';

const ReplyToCommentInput = ({ parentComment, postId, onClose, onGetFocusReply }) => {
  const dispatch = useDispatch();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const account = Cookie.get('account');
  const parsedAccount = account ? JSON.parse(account) : null;

  const backendUrl = 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images';
  const avatarUrl = `${backendUrl}/${parsedAccount?.user_profile_picture || 'profile_place_holder.webp'}`;

  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSendReply = useCallback(() => {
    if (content.trim()) {
      const data = {
        postId,
        commentId: parentComment.id,
        content,
        file,
      };

      dispatch(wotgsocial.post.addReplyToCommentAction(data))
        .then((res) => {
          setContent('');
          setFile(null);
          setPreviewUrl('');
          // onClose();
          onGetFocusReply(res.data)
        })
        .catch((error) => {
          console.error('Error sending reply:', error);
        });
    }
  }, [content, file, dispatch, parentComment.id, postId, onClose]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const removePreview = () => {
    setFile(null);
    setPreviewUrl('');
    fileInputRef.current.value = '';
  };

  return (
    <div className={styles.replyWrapper}>
      <img src={avatarUrl} alt="avatar" className={styles.avatar} />

      <div className={styles.replyBox}>
        {previewUrl && (
          <div className={styles.previewContainer}>
            <img src={previewUrl} alt="preview" className={styles.previewImage} />
            <button className={styles.removePreviewButton} onClick={removePreview}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.textarea}
          rows={1}
          placeholder="Write a reply..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendReply();
            }
          }}
        />

        <div className={styles.actions}>
          <div className={styles.iconRow}>
            <label className={styles.icon}>
              <FontAwesomeIcon icon={faImage} />
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <button
            className={styles.sendBtn}
            onClick={handleSendReply}
            disabled={!content.trim() && !file}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ReplyToCommentInput);
