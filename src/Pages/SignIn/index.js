import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import styles from './index.module.css';

const Page = () => {
    const { error } = useSelector((state) => state.wotgsocial.user);
    const {
        ui: { loading },
    } = useSelector((state) => state.common);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

    const handleSubmitLogin = (event) => {
        event.preventDefault();
    
        const payload = { email, password };
    
        dispatch(common.ui.setLoading());
        dispatch(wotgsocial.user.loginFunction(payload))
            .then((res) => {
                if (res.success) {
                    // Notify Flutter about login success
                    if (window.flutter_inappwebview) {
                        window.flutter_inappwebview.callHandler("onLoginSuccess", {
                            userId: res.user.id, // Adjust based on API response
                            name: res.user.name, // Adjust based on API response
                            token: res.token // JWT or session token
                        });
                    }
    
                    // Redirect to the menu page
                    window.location.replace('/menu');
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
                    <h1 className={styles.heading}>Login</h1>
                    <form className={styles.form} onSubmit={handleSubmitLogin}>
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
                        <div className={styles.formGroup}>
                            <label htmlFor="password" className={styles.label}>
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                Sign In
                            </button>
                        </div>
                    </form>
                    {openErrorSnackbar && (
                        <div className={styles.errorMessage}>{errMsg}</div>
                    )}
                    <p className={styles.footerText}>
                        Don't have an account?{' '}
                        <a href="/register" className={styles.link}>
                            Sign Up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Page;
