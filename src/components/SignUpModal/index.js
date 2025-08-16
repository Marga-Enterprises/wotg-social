import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import { useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';

const SignUpModal = ({ onClose }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    user_fname: '',
    user_lname: '',
    user_gender: '',
    email: '',
    user_mobile_number: '',
    user_social_media: '',
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

    dispatch(wotgsocial.user.addUser(formData))
      .then(res => {
        if (res.success) {
          window.location.replace('/');
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

              <div className={styles.inputGroup}>
                <label className={styles.label}>Mobile Number</label>
                <input
                  type="tel"
                  name="user_mobile_number"
                  value={formData.user_mobile_number}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="09XXXXXXXXX"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Messenger Name</label>
                <input
                  type="text"
                  name="user_social_media"
                  value={formData.user_social_media}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Your Facebook/Messenger name"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Gender</label>
                <select
                  name="user_gender"
                  value={formData.user_gender}
                  onChange={handleChange}
                  className={styles.input}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
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
