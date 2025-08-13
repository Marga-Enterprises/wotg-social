// fa icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

// css
import styles from './index.module.css';

// cookies.js
import Cookies from 'js-cookie';

const NewNavbar = ({ onToggleMenu }) => {
    const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;

    const profilePic = account?.user_profile_pic; // Adjust to match your API key for profile image
    const initial = account?.user_fname ? account.user_fname.charAt(0).toUpperCase() : "U";

    return (
        <nav className={styles.navbar}>
            <div className={styles.navLeft}>
                {profilePic ? (
                    <img
                        src={profilePic}
                        alt={account?.user_fname || "User"}
                        className={styles.userImage}
                    />
                ) : (
                    <div className={styles.userIcon}>{initial}</div>
                )}

                <div className={styles.userText}>
                    <span className={styles.welcome}>WELCOME BACK</span>
                    <span className={styles.username}>{account?.user_fname || "User"}</span>
                </div>
            </div>

            <div className={styles.navRight}>
                {/*<div className={styles.streakBadge}>
                    <span className={styles.streakNumber}>24</span>
                    <span className={styles.streakLabel}>days</span>
                </div>*/}

                {/* ✅ Hamburger menu trigger */}
                <div className={styles.burger} onClick={onToggleMenu}>
                    <FontAwesomeIcon icon={faBars} className={styles.burgerIcon} />
                </div>
            </div>
        </nav>
    );
};

export default NewNavbar;
