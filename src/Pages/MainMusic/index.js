import React from 'react';
import { Link } from 'react-router-dom';
import styles from './index.module.css';
import AlbumsSection from '../../sections/AlbumsSection';

const Page = () => {
  return (
    <div className={styles.page}>
      {/* Section: New Releases */}

      <div className={styles.pageContent}>
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>New Releases</h2>
            <Link to="/albums" className={styles.showAllBtn}>
              Show all
            </Link>
          </header>

          <div className={styles.carouselWrapper}>
            <AlbumsSection />
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>New Releases</h2>
            <Link to="/albums" className={styles.showAllBtn}>
              Show all
            </Link>
          </header>

          <div className={styles.carouselWrapper}>
            <AlbumsSection />
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>New Releases</h2>
            <Link to="/albums" className={styles.showAllBtn}>
              Show all
            </Link>
          </header>

          <div className={styles.carouselWrapper}>
            <AlbumsSection />
          </div>
        </section>  
      </div>
    </div>
  );
};

export default Page;
