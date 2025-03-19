import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import styles from './index.module.css';
import LoadingSpinner from "../../components/LoadingSpinner";

// FontAwesome Icons (Optimized Import)
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Page = () => {
    const {
        ui: { loading },
    } = useSelector((state) => state.common);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token } = useParams();
    const authToken = Cookies.get('token');

    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
    const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setConfirmShowPassword] = useState(false);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const toggleConfirmPasswordVisibility = useCallback(() => {
        setConfirmShowPassword((prev) => !prev);
    }, []);

    const handleSubmitResetPass = (event) => {
        event.preventDefault();

        const payload = { 
            token, 
            newPassword: newPass, 
            confirmNewPassword: confirmPass
        };

        dispatch(common.ui.setLoading());
        dispatch(wotgsocial.user.resetPasswordAction(payload))
            .then((res) => {
                if (res.success) {
                    setOpenSuccessSnackbar(true);
                    setSuccessMsg(res.msg);
                } else {
                    setOpenErrorSnackbar(true);
                    setErrMsg(res.payload);
                }
            })
            .catch((error) => {
                console.error('An error occurred during reset password:', error);
                setOpenErrorSnackbar(true);
                setErrMsg('An unexpected error occurred. Please try again.');
            })
            .finally(() => {
                dispatch(common.ui.clearLoading());
            });
    };

    useEffect(() => {
        if (authToken) {
            navigate('/login');
        }

        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <>
            { loading ? <LoadingSpinner /> : (
                <div className={styles.container}>
                    {/* Left Side Content */}
                    <div className={styles.leftSection}>
                        <h1 className={styles.largeText}>WOTG Community</h1>
                        <h2 className={styles.mediumText}>Grow Together in His Word.</h2>
                        <p className={styles.smallText}>
                            Connect with others, share His love, and grow in faith together.
                        </p>
                    </div>

                    {/* Right Side Login Form */}
                    <div className={styles.rightSection}>
                        <div className={styles.formWrapper}>
                            <h1 className={styles.heading}>Enter your new password</h1>
                            <form className={styles.form} onSubmit={handleSubmitResetPass}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="password" className={styles.label}>
                                        New Password
                                    </label>
                                    <div className={styles.passwordContainer}>
                                        <input
                                            type={showPassword ? "" : "password"}
                                            id="newPass"
                                            name="newPass"
                                            value={newPass}
                                            onChange={(e) => setNewPass(e.target.value)}
                                            className={styles.input}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={styles.eyeButton}
                                            onClick={togglePasswordVisibility}
                                        >
                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="password" className={styles.label}>
                                        Confirm New Password
                                    </label>
                                    <div className={styles.passwordContainer}>
                                        <input
                                            type={showConfirmPassword ? "" : "password"}
                                            id="confirmPass"
                                            name="confirmPass"
                                            value={confirmPass}
                                            onChange={(e) => setConfirmPass(e.target.value)}
                                            className={styles.input}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={styles.eyeButton}
                                            onClick={toggleConfirmPasswordVisibility}
                                        >
                                            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className={styles.button}
                                        disabled={loading}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                            {openErrorSnackbar && !openSuccessSnackbar && (
                                <div className={styles.errorMessage}>{errMsg}</div>
                            )}

                            {openSuccessSnackbar && !openErrorSnackbar && (
                                <div className={styles.successMessage}>{successMsg}</div>
                            )}
                            <p className={styles.footerText}>
                                Back to{' '}
                                <a href="/" className={styles.link}>
                                    login
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            ) }
        </>
    );
};

export default React.memo(Page);
