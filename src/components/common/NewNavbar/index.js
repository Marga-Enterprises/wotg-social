// react-router
import { Link } from 'react-router-dom';

// fa icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

// css
import styles from './index.module.css';

// cookies.js
import Cookies from 'js-cookie';

const NewNavbar = ({ onToggleMenu }) => {
    const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;

    const backendUrl = 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images'; 
    const profilePic = account?.user_profile_picture;
    const initial = account?.user_fname ? account.user_fname.charAt(0).toUpperCase() : "U";

    return (
        <nav className={styles.navbar}>
            <div className={styles.navLeft}>
                <Link to={`/profile/${account?.id}`} className={styles.avatarLink}>
                    {profilePic ? (
                        <div className={styles.userImageWrapper}>
                            <img
                                src={`${backendUrl}/${profilePic}`}
                                alt={account?.user_fname || "User"}
                                className={styles.userImage}
                            />
                        </div>
                    ) : (
                        <div className={styles.userIcon}>{initial}</div>
                    )}
                </Link>

                <div className={styles.userText}>
                    <span className={styles.welcome}>WELCOME BACK</span>
                    <span className={styles.username}>
                        {account?.user_fname || "User"} {account?.user_lname || "User"}
                    </span>
                </div>
            </div>

            <div className={styles.navRight}>
                <div className={styles.burger} onClick={onToggleMenu}>
                    <FontAwesomeIcon icon={faBars} className={styles.burgerIcon} />
                </div>
            </div>
        </nav>
    );
};

export default NewNavbar;
