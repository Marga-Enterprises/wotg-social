import React, { useState } from 'react';
import styles from './index.module.css';
import { useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';

const SignUpModal = ({ onClose, targetUserId }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    id: targetUserId || '',
    user_fname: '',
    user_lname: '',
    email: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(common.ui.setLoading());

    dispatch(wotgsocial.user.updateUserThroughChatAction(formData))
      .then(res => {
        if (res.success) {
          if (res.success && res.data.triggerRefresh) {
            dispatch(
              wotgsocial.user.reloginAction(res.data.accessToken)
            ).finally(() => window.location.reload());
          }
        } else {
          setError(res.payload || 'Failed to register.');
        }
      })
      .catch(() => {
        setError('An unexpected error occurred. Please try again.');
      })
      .finally(() => {
        dispatch(common.ui.clearLoading());
      });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
          <h2 className={styles.title}>Sign Up</h2>

          {/* 👋 Greeting Message Section */}
          <div className={styles.greetingMessage}>
            <p>Hello kapatid! 👋</p>
            <p>
              Maraming salamat sa pag-bisita sa ating <strong>Word on the Go (WOTG)</strong> app.  
              Dito ay makikita mo ang mga inspiring features gaya ng <em>daily devotions, Bible, journal, community feeds</em>, at marami pang iba.  
              Maaari ka ring makipag-ugnayan sa amin dito mismo!
            </p>
            <p>
              Para makapagsimula, punan mo lamang ang mga detalye sa ibaba:
              <br />• First Name  
              <br />• Last Name  
              <br />• Email Address
            </p>
            <p>
              Kapag nakapag-fill out ka na, maikokonek na kita sa ating team para tulungan kang makilala pa nang mas malalim ang Panginoon. 🙏
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.profileForm}>
            <div className={styles.profileDetails}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>First Name</label>
                <input
                  type="text"
                  name="user_fname"
                  value={formData.user_fname}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Last Name</label>
                <input
                  type="text"
                  name="user_lname"
                  value={formData.user_lname}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Enter your last name"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {error && (
              <div className={styles.errorMessage}>{error}</div>
            )}

            <div className={styles.buttonContainer}>
              <button type="submit" className={styles.submitButton}>
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
