import { useState, useEffect, useMemo } from 'react';
import styles from './index.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';
import Cookies from 'js-cookie';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useParams } from 'react-router-dom';

// fontawesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { ui: { loading } } = useSelector((state) => state.common);

  const backendUrl = useMemo(() =>
    'https://wotg.sgp1.cdn.digitaloceanspaces.com/images',
    []
  );

  const [user, setUser] = useState({});
  const [errMsg, setErrMsg] = useState('');
  const [formData, setFormData] = useState({
    user_fname: '',
    user_lname: '',
    file: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
    dispatch(common.ui.setLoading());
    dispatch(wotgsocial.user.getUserAction({ id }))
        .then((res) => {
            if (res.success) {
                setUser(res.data);
                setFormData({
                    user_fname: res.data.user_fname || '',
                    user_lname: res.data.user_lname || '',
                    file: null,
                });
                if (res.data.user_profile_picture) {
                    setPreviewImage(`${backendUrl}/${res.data.user_profile_picture}`);
                }
            } else {
                setErrMsg(res.payload || "Failed to fetch user profile.");
            }
        })
        .catch((err) => {
            console.error("Error fetching user profile:", err);
            setErrMsg(err.response?.data?.msg || "An error occurred while fetching the profile.");
        })
        .finally(() => dispatch(common.ui.clearLoading()));
    }, [dispatch, id]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, file });

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      id: user.id,
      user_fname: formData.user_fname,
      user_lname: formData.user_lname,
      file: formData.file,
    };

    dispatch(common.ui.setLoading());
    dispatch(wotgsocial.user.updateUserAction(payload)).then((res) => {
      if (res.success) {
        setUser(res.data);
        Cookies.set('account', JSON.stringify(res.data));
        if (res.data.user_profile_picture) {
          setPreviewImage(`${backendUrl}/${res.data.user_profile_picture}`);
        }
      } else {
        alert('Failed to update profile');
      }
    }).finally(() => dispatch(common.ui.clearLoading()));
  };

    return loading ? (
        <LoadingSpinner />
    ) : errMsg ? (
        <div className={styles.errorWrapper}>
            <FontAwesomeIcon icon={faExclamationTriangle} size="2x" color="#b92c1d" />
            <p className={styles.errorMessage}>{errMsg}</p>
        </div>
    ) : (
        <div className={styles.pageWrapper}>
            <div className={styles.profileCard}>
                <h2 className={styles.title}>My Profile</h2>
                <form onSubmit={handleSubmit} className={styles.profileForm}>
                    <div className={styles.imageWrapper}>
                        <label htmlFor="file" className={styles.imageLabel}>
                        {previewImage ? (
                            <img src={previewImage} alt="Profile Preview" className={styles.profileImage} />
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

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>First Name</label>
                        <input
                            type="text"
                            name="user_fname"
                            value={formData.user_fname}
                            onChange={handleChange}
                            className={styles.input}
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
                        />
                    </div>

                    <button type="submit" className={styles.submitButton}>
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    ); 
}

export default ProfilePage;
