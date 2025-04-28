import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';
import Cookies from 'js-cookie';
import LoadingSpinner from '../LoadingSpinner';

const BACKEND_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/uploads'
    : 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images';

const Profile = ({ onClose }) => {
    const dispatch = useDispatch();
    const { ui: { loading } } = useSelector((state) => state.common);

    const [user, setUser] = useState({});
    const [formData, setFormData] = useState({
        user_fname: '',
        user_lname: '',
        // email: '',
        file: null, // Holds the File object for uploads
    });
    const [previewImage, setPreviewImage] = useState(null);

    const account = Cookies.get('account');
    const userAccount = account ? JSON.parse(account) : null;

    useEffect(() => {
        dispatch(common.ui.setLoading());
        const payload = { id: userAccount?.id };

        dispatch(wotgsocial.user.getUserAction(payload))
            .then((res) => {
                if (res.success) {
                    setUser(res.data);
                    setFormData({
                        user_fname: res.data.user_fname || '',
                        user_lname: res.data.user_lname || '',
                        // email: res.data.email || '',
                        file: null, // Reset file input to avoid re-upload issues
                    });

                    if (res.data.user_profile_picture) {
                        setPreviewImage(`${BACKEND_URL}/${res.data.user_profile_picture}`);
                    }
                }
            })
            .finally(() => dispatch(common.ui.clearLoading()));
    }, [dispatch]);

    // Handle text input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, file });

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            id: user.id,
            user_fname: formData.user_fname,
            user_lname: formData.user_lname,
            // email: formData.email,
            file: formData.file, // Ensures file is correctly sent
        };
        dispatch(common.ui.setLoading());
        dispatch(wotgsocial.user.updateUserAction(payload)).then((res) => {
            if (res.success) {
                setUser(res.data);
                Cookies.set('account', JSON.stringify(res.data)); // Update stored user data

                if (res.data.user_profile_picture) {
                    setPreviewImage(`${BACKEND_URL}/uploads/${res.data.user_profile_picture}`);
                }
            } else {
                alert('Failed to update profile');
            }
        }).finally(() => dispatch(common.ui.clearLoading()));
    };

    return loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.modalOverlay} onClick={onClose}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalContent}>
              <button className={styles.closeButton} onClick={onClose}>&times;</button>
              <h2 className={styles.title}>Update Profile</h2>
      
              <form onSubmit={handleSubmit} className={styles.profileForm}>
                {/* Profile Image Section */}
                <div className={styles.profileImageContainer}>
                  <label htmlFor="file" className={styles.profileImageLabel}>
                    {previewImage ? (
                      <img loading="lazy" src={previewImage} alt="Profile Preview" className={styles.profileImage} />
                    ) : (
                      <div className={styles.placeholder}>Upload Image</div>
                    )}
                  </label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                </div>
      
                {/* Profile Details Section */}
                <div className={styles.profileDetails}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>First Name</label>
                    <input
                      type="text"
                      name="user_fname"
                      value={formData.user_fname}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Enter your name"
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
                      placeholder="Enter your name"
                    />
                  </div>
      
                  {/*<div className={styles.inputGroup}>
                    <label className={styles.label}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Enter your email"
                    />
                  </div>*/}
                </div>
      
                {/* Submit Button */}
                <div className={styles.buttonContainer}>
                  <button type="submit" className={styles.submitButton}>
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );      
};

export default Profile;
