import React from 'react';

//css
import styles from './index.module.css';

// contexts
import { useSocket } from '../../contexts/SocketContext';

// sections
import FeedsListSection from '../../sections/FeedsListSection';

const Page = () => {
  const socket = useSocket();

  return (
    <div className={styles.container}>
      <FeedsListSection socket={socket} />
    </div>
  );
}

export default Page;