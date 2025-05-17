import React, { useState, useRef } from 'react';
import styles from './index.module.css';
import { useDispatch } from 'react-redux';
import { wotgsocial } from '../../../redux/combineActions';

const CommentTextInput = ({ postId, user, onScrollToBottom }) => {
  const dispatch = useDispatch();
  const textareaRef = useRef(null);
  const [content, setContent] = useState('');

  const handleInputChange = (e) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    onScrollToBottom();

    const payload = {
      postId,
      content: trimmed,
    };

    try {
      const res = await dispatch(wotgsocial.post.addCommentToPostAction(payload));
      if (res?.data) {
        setContent('');
        textareaRef.current.style.height = 'auto';
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
    <div className={styles.inputWrapper}>
      <img
        className={styles.avatar}
        src={`https://wotg.sgp1.cdn.digitaloceanspaces.com/images/${user?.user_profile_picture || 'profile_place_holder.webp'}`}
        alt="avatar"
      />

      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Write a comment..."
        className={styles.textarea}
        rows={1}
      />

      <button
        className={styles.sendButton}
        onClick={handleSubmit}
        disabled={!content.trim()}
      >
        Send
      </button>
    </div>
  );
};

export default React.memo(CommentTextInput);
