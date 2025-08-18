import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faBible,
    faUsers,
    faPrayingHands,
    faUser
} from '@fortawesome/free-solid-svg-icons';

// cookiejs
import Cookies from 'js-cookie';

import styles from './index.module.css';

const NewFooter = () => {
    const parsedAccount = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;
    const role = Cookies.get('role');

    return (
        <footer className={styles.footer}>
            <ul className={styles.footerNav}>
                <li className={styles.navItem}>
                    <Link to="/" className={styles.navLink}>
                        <FontAwesomeIcon icon={faHome} className={styles.navIcon} />
                        <span className={styles.navLabel}>Home</span>
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link to="/bible" className={styles.navLink}>
                        <FontAwesomeIcon icon={faBible} className={styles.navIcon} />
                        <span className={styles.navLabel}>Bible</span>
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link to="/feeds" className={styles.navLink}>
                        <FontAwesomeIcon icon={faUsers} className={styles.navIcon} />
                        <span className={styles.navLabel}>Community</span>
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link to="/your-journals" className={styles.navLink}>
                        <FontAwesomeIcon icon={faPrayingHands} className={styles.navIcon} />
                        <span className={styles.navLabel}>Pray</span>
                    </Link>
                </li>
                {role !== 'guest' && (
                    <li className={styles.navItem}>
                        <Link to={`/profile/${parsedAccount.id}`} className={styles.navLink}>
                            <FontAwesomeIcon icon={faUser} className={styles.navIcon} />
                            <span className={styles.navLabel}>Profile</span>
                        </Link>
                    </li>
                )}
            </ul>
        </footer>
    );
};

export default NewFooter;
