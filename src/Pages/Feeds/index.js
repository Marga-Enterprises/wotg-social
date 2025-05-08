import React from 'react';

//css
import styles from './index.module.css';

// sections
import FeedsListSection from '../../sections/FeedsListSection';

const Page = () => {
  return (
    <div className={styles.container}>
      <FeedsListSection />
    </div>
  );
}

export default Page;