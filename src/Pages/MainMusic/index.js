import React from 'react';
import { Link } from 'react-router-dom';
import styles from './index.module.css';
import AlbumsSection from '../../sections/AlbumsSection';

const Page = () => {
  return (
    <div className={styles.page}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>New Releases</h2>
          <Link to="/albums" className={styles.showAllBtn}>
            Show all
          </Link>
        </div>
        <AlbumsSection />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Trendings</h2>
          <Link to="/albums" className={styles.showAllBtn}>
            Show all
          </Link>
        </div>
        <AlbumsSection />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Albums</h2>
          <Link to="/albums" className={styles.showAllBtn}>
            Show all
          </Link>
        </div>
        <AlbumsSection />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Genres</h2>
          <Link to="/albums" className={styles.showAllBtn}>
            Show all
          </Link>
        </div>
        <AlbumsSection />
      </div>
    </div>
  );
};

export default Page;
