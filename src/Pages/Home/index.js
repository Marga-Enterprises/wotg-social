// Home.js (or index.js)
import React from 'react';
import styles from './index.module.css'; // Import as a module

const Home = () => {
  return (
    <div className={styles.home}> {/* Use styles from the module */}
      <h1>Welcome to the Home Page TEST!</h1>
    </div>
  );
}

export default Home;
