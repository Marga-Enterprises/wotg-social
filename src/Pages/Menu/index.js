import React, { useEffect } from 'react';
import { useSetHideNavbar } from "../../contexts/NavbarContext";

import styles from './index.module.css';

const Page = () => {
    const setHideNavbar = useSetHideNavbar();

    useEffect(() => {
        setHideNavbar(true);
        return () => setHideNavbar(false);
    }, [setHideNavbar]);

    return (
        <div className={styles.container}> 
            <div className={styles.menu}>
                <div className={styles.menuHeader}>Where do you want to go?</div>
                <ul className={styles.menuList}>
                    <li><a href="/worship">Worship</a></li>
                    <li><a href="/">Chat</a></li>
                    <li><a href="/blogs">Devotion</a></li>
                    <li><a href="/bible">Bible</a></li>
                    <li><a href="/your-journals">Journals</a></li>
                </ul>
            </div>
        </div>
    );
}

export default Page;