import React from 'react';
import { Link } from 'react-router-dom';
import styles from './index.module.css';

// SECTIONS
import AlbumsSection from '../../sections/AlbumsSection';
import NewReleaseSection from '../../sections/NewReleaseSection';
import MostPopularSection from '../../sections/MostPopularSection';
import PlayListSideBarSection from '../../sections/PlayListSideBarSection';
import PlayListSmallScreenSection from '../../sections/PlayListSmallScreenSection';

// HOOKS
import useWindowDimensions from '../../hooks/useWindowDimensions';

const Page = () => {
  const { width } = useWindowDimensions();

  return (
    <div className={styles.page}>

      { width >= 1030 &&
        <PlayListSideBarSection/>
      }
      
      <div className={styles.pageContent}>
        { width <= 1030 &&
          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <h2>Playlists</h2>
              {/*<Link to="/albums" className={styles.showAllBtn}>
                Show all
              </Link>*/}
            </header>

            <div className={styles.carouselWrapper}>
              <PlayListSmallScreenSection />
            </div>
          </section>
        }

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>New Releases</h2>
            {/*<Link to="/albums" className={styles.showAllBtn}>
              Show all
            </Link>*/}
          </header>

          <div className={styles.carouselWrapper}>
            <NewReleaseSection />
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>Most Popular</h2>
            {/*<Link to="/albums" className={styles.showAllBtn}>
              Show all
            </Link>*/}
          </header>

          <div className={styles.carouselWrapper}>
            <MostPopularSection />
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>Albums</h2>
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
