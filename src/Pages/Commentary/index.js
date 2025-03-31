import { useLocation, useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import wotgLogo from "./wotg-logo.webp";

const Page = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const commentary = location.state?.commentary;

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.mainContainer}>
      {/* Navbar */}
      <div className={styles.navbar}>
        <div className={styles.logo}>
          <img src={wotgLogo} alt="WOTG Logo" />
        </div>
        <div className={styles.navLinks}>
          <a href="/" className={styles.navLink}>Chat</a>
          <a href="/bible" className={styles.navLink}>Bible</a>
          <a href="/worship" className={styles.navLink}>Worship</a>
          <a href="https://wotgonline.com/donate/" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Give</a>
        </div>
      </div>

      {/* Go Back */}
      <div className={styles.goBackWrapper}>
        <button onClick={handleGoBack} className={styles.goBackButton}>
          ← Back
        </button>
      </div>

      {/* Commentary Content */}
      <div className={styles.content}>
        <h2>Commentary</h2>
        {commentary ? (
          <p>{commentary}</p>
        ) : (
          <p className={styles.empty}>No commentary available for this verse.</p>
        )}
      </div>
    </div>
  );
};

export default Page;
