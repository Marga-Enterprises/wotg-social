import React, { useEffect } from 'react';
import { useSetHideNavbar } from "../../contexts/NavbarContext";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPrayingHands, faComments, faBookOpen,
  faBible, faPenFancy, faMusic, faNewspaper
} from '@fortawesome/free-solid-svg-icons';

import styles from './index.module.css';

const menuItems = [
  { label: "Worship", href: "/worship", icon: faPrayingHands },
  { label: "Chat", href: "/", icon: faComments },
  { label: "Devotion", href: "/blogs", icon: faBookOpen },
  { label: "Bible", href: "/bible", icon: faBible },
  { label: "Journal", href: "/your-journals", icon: faPenFancy },
  { label: "Music", href: "/music", icon: faMusic },
  { label: "Feeds", href: "/feeds", icon: faNewspaper },
];

const Page = () => {
  const setHideNavbar = useSetHideNavbar();

  useEffect(() => {
    setHideNavbar(true);
    return () => setHideNavbar(false);
  }, [setHideNavbar]);

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.menu}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.menuHeader}>Where do you want to go?</div>
        <div className={styles.gridMenu}>
          {menuItems.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              className={styles.gridItem}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
            >
              <FontAwesomeIcon icon={item.icon} className={styles.icon} />
              <span>{item.label}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Page;
