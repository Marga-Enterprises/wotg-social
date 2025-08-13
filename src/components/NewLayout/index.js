import styles from './index.module.css';
import NewNavbar from '../common/NewNavbar';
import NewFooter from '../common/NewFooter';
import BurgerMenu from '../BurgerMenu';
import Cookies from 'js-cookie';

const NewLayout = ({ children, onToggleMenu, menuOpen }) => {
    const token = Cookies.get('token');

    return (
        <div className={styles.layout}>
            {/* ✅ Show navbar only if token exists */}
            {token && (
                <>
                    <NewNavbar onToggleMenu={onToggleMenu} />
                    {menuOpen && <BurgerMenu onClose={onToggleMenu} />}
                </>
            )}

            {/* Scrollable content area */}
            <main className={styles.mainContent}>
                {children}
            </main>

            {/* ✅ Show footer only if token exists */}
            {token && <NewFooter />}
        </div>
    );
};

export default NewLayout;
