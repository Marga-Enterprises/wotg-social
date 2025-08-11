import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { wotgsocial, common } from "../../redux/combineActions";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styles from "./index.module.css";

// FontAwesome Icons (Optimized Import)
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// context
import { useSetHideNavbar } from "../../contexts/NavbarContext";

const Page = () => {
  const {
    ui: { loading },
  } = useSelector((state) => state.common);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const setHideNavbar = useSetHideNavbar();

  const token = Cookies.get('token');
  const role = Cookies.get('role');

  // ✅ State Optimized
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

  // ✅ Memoized Toggle Password Function
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // ✅ Memoized Handle Submit
  const handleSubmitLogin = useCallback(
    (event) => {
      event.preventDefault();
      const payload = { email, password };
      
      if (token && role === 'guest') {
        dispatch(wotgsocial.user.userLogout());
      };

      dispatch(common.ui.setLoading());
      dispatch(wotgsocial.user.loginFunction(payload))
        .then((res) => {
          if (res.success) {
            window.location.replace("/");
          } else {
            setOpenErrorSnackbar(true);
            setErrMsg(res.payload);
          }
        })
        .catch((error) => {
          console.error("An error occurred during login:", error);
          setOpenErrorSnackbar(true);
          setErrMsg("An unexpected error occurred. Please try again.");
        })
        .finally(() => {
          dispatch(common.ui.clearLoading());
        });
    },
    [dispatch, email, password]
  );

  const handleGuestLogin = useCallback(() => {
    if (token && role === 'guest') {
      dispatch(wotgsocial.user.userLogout());
    };

    dispatch(common.ui.setLoading());
    dispatch(wotgsocial.user.guestLoginFunction())
      .then((res) => {
        if (res.success) {
          window.location.replace("/");
        } else {
          setOpenErrorSnackbar(true);
          setErrMsg(res.payload);
        }
      })
      .catch((error) => {
        console.error("An error occurred during guest login:", error);
        setOpenErrorSnackbar(true);
        setErrMsg("An unexpected error occurred. Please try again.");
      })
      .finally(() => {
        dispatch(common.ui.clearLoading());
      });
  }, [dispatch]);

  // ✅ Prevent Unnecessary Navigation Checks
  useEffect(() => {
      if (token && role !== 'guest') {
          navigate('/');
      }
  }, [navigate]);

  useEffect(() => {
      setHideNavbar(true);
      return () => setHideNavbar(false);
  }, [setHideNavbar]);

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
                <div className={styles.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div>
                <button
                  type="submit"
                  className={styles.button}
                  disabled={loading}
                >
                  Sign In
                </button>
              </div>

              {/* Continue as Guest */}
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                { token && role === 'guest' ? (
                  <button
                    type="button"
                    className={`${styles.button} ${styles.guestButtonOutlined}`}
                    onClick={() => navigate('/')}
                    disabled={loading}
                  >
                    Already signed in as Guest
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`${styles.button} ${styles.guestButtonOutlined}`}
                    onClick={handleGuestLogin}
                    disabled={loading}
                  >
                    Continue as a Guest
                  </button>
                )}
              </div>
            </form>

          {openErrorSnackbar && (
            <div className={styles.errorMessage}>{errMsg}</div>
          )}

          <p className={styles.footerText}>
            Don't have an account?{" "}
            <a href="/register" className={styles.link}>
              Sign Up
            </a>
          </p>

          <p className={styles.footerText}>
            Forgot password?{" "}
            <a href="/forgot-password" className={styles.link}>
              Click here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Page);
