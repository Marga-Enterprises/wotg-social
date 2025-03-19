import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import styles from './index.module.css';
import LoadingSpinner from "../../components/LoadingSpinner";

const Page = () => {
    const {
        ui: { loading },
    } = useSelector((state) => state.common);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
    const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);

    const handleSubmitForgotPass = (event) => {
        event.preventDefault();

        const payload = { email };

        dispatch(common.ui.setLoading());
        dispatch(wotgsocial.user.forgotPasswordAction(payload))
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
                console.error('An error occurred during login:', error);
                setOpenErrorSnackbar(true);
                setErrMsg('An unexpected error occurred. Please try again.');
            })
            .finally(() => {
                dispatch(common.ui.clearLoading());
            });
    };

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            navigate('/menu');
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
                            <h1 className={styles.heading}>Forgot Password</h1>
                            <form className={styles.form} onSubmit={handleSubmitForgotPass}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email" className={styles.label}>
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={styles.input}
                                        required
                                    />
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
                            {openErrorSnackbar && (
                                <div className={styles.errorMessage}>{errMsg}</div>
                            )}

                            {openSuccessSnackbar && (
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
