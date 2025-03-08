import React from 'react';

import styles from './index.module.css';

const Page = () => {
    return (
        <div className={styles.container}> 
            <div className={styles.menu}>
                <div className={styles.menuHeader}>Where do you want to go?</div>
                <ul className={styles.menuList}>
                    <li><a href="/worship">Worship</a></li>
                    <li><a href="/">Chat</a></li>
                    <li><a href="/blogs">Devotion</a></li>
                </ul>
            </div>
        </div>
    );
}

export default Page;