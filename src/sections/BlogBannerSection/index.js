// src/sections/BlogBannerSection.jsx

import React from 'react';
import styles from './index.module.css';

const BlogBannerSection = () => {
  return (
    <div className={styles.banner}>
      <img
        src="https://wotg.sgp1.cdn.digitaloceanspaces.com/images/prayer.webp"
        alt="Banner"
        loading="lazy"
        className={styles.bannerImage}
      />
      <div className={styles.overlay}></div>
      <div className={styles.bannerContent}>
        <h2>Romans 1:16</h2>
        <p>“For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes…”</p>
      </div>
    </div>
  );
};

export default React.memo(BlogBannerSection);
