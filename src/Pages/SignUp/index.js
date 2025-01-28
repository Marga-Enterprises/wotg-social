import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import styles from './index.module.css';

const Page = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Form state management
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

    const handleSubmitSignUp = (event) => {
        event.preventDefault();

        const payload = {
            user_fname: firstName,
            user_lname: lastName,
            user_gender: gender,
            email,
            password,
        };

        dispatch(common.ui.setLoading());
        dispatch(wotgsocial.user.addUser(payload))
            .then((res) => {
                if (res.success) {
                    window.location.replace('/login');
                } else {
                    setOpenErrorSnackbar(true);
                    setErrMsg(res.payload);
                }
            })
            .catch((error) => {
                console.error('An error occurred during registration:', error);
                setOpenErrorSnackbar(true);
                setErrMsg('An unexpected error occurred. Please try again.');
            })
            .finally(() => {
                dispatch(common.ui.clearLoading());
            });
    };

    return (
        <div className={styles.container}>
            {/* Left Section */}
            <div className={styles.leftSection}>
                <h1 className={styles.largeText}>WOTG Community</h1>
                <h2 className={styles.mediumText}>Grow Together in His Word.</h2>
                <p className={styles.smallText}>
                    Connect with others, share His love, and grow in faith together.
                </p>
            </div>

            {/* Right Section (Sign-Up Form) */}
            <div className={styles.rightSection}>
                <div className={styles.formWrapper}>
                    <h1 className={styles.heading}>Register</h1>
                    <form className={styles.form} onSubmit={handleSubmitSignUp}>
                        <div className={styles.formGroup}>
                            <label htmlFor="first-name" className={styles.label}>
                                First Name
                            </label>
                            <input
                                type="text"
                                id="first-name"
                                name="first-name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="last-name" className={styles.label}>
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="last-name"
                                name="last-name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Email Address
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

                        <div className={styles.formGroup}>
                            <label htmlFor="gender" className={styles.label}>
                                Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className={styles.input}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className={styles.button}
                            >
                                Register
                            </button>
                        </div>
                    </form>

                    {openErrorSnackbar && (
                        <div className={styles.errorMessage}>{errMsg}</div>
                    )}

                    <p className={styles.footerText}>
                        Already have an account?{' '}
                        <a href="/login" className={styles.link}>
                            Log In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Page;
