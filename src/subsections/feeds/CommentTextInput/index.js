import React, { useState, useRef } from 'react';
import styles from './index.module.css';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../../redux/combineActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImage,
  faPaperPlane,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const CommentTextInput = ({ postId, user, onGetFocusComment }) => {
  const dispatch = useDispatch();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleInputChange = (e) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePreview = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed && !selectedFile) return;

    const payload = {
      postId,
      content: trimmed,
      file: selectedFile
    };

    try {
      const res = await dispatch(wotgsocial.post.addCommentToPostAction(payload));
      if (res?.data) {
        setContent('');
        setSelectedFile(null);
        setPreviewUrl('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        onGetFocusComment(res.data);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={styles.commentBox}>
      <img
        className={styles.avatar}
        src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${user?.user_profile_picture || 'profile_place_holder.webp'}`}
        alt="avatar"
      />

      <div className={styles.textAreaContainer}>
        {previewUrl && (
          <div className={styles.previewContainer}>
            <img src={previewUrl} alt="preview" className={styles.previewImage} />
            <button className={styles.removePreviewButton} onClick={handleRemovePreview}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment..."
          className={styles.textarea}
          rows={1}
        />

        <div className={styles.iconRow}>
          <label className={styles.icon}>
            <FontAwesomeIcon icon={faImage} />
            <input
              type="file"
              hidden
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </label>
        </div>

        <button
          className={styles.sendButton}
          onClick={handleSubmit}
          disabled={!content.trim() && !selectedFile}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(CommentTextInput);
