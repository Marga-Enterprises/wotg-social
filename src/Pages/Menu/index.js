import { useEffect } from 'react';
import { useSetHideNavbar } from "../../contexts/NavbarContext";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPrayingHands, faComments, faBookOpen,
  faBible, faPenFancy, faMusic, faNewspaper,
  faCalendar, faUsers, faVideo
} from '@fortawesome/free-solid-svg-icons';

import styles from './index.module.css';

// sections
import ActiveUsersSection from '../../sections/MenuPageSections/ActiveUsersSection';
import VerseOfTheDaySection from '../../sections/MenuPageSections/VerseOfTheDaySection';

const menuItems = [
  { title: "Worship", subtitle: "Lift your heart", href: "/worship", icon: faPrayingHands },
  { title: "Chat", subtitle: "Connect with others", href: "/chat", icon: faComments },
  { title: "Devotion", subtitle: "Daily reflections", href: "/blogs", icon: faBookOpen },
  { title: "Bible", subtitle: "Read the Word", href: "/bible", icon: faBible },
  { title: "Journal", subtitle: "Write your thoughts", href: "/your-journals", icon: faPenFancy },
  { title: "Music", subtitle: "Songs of praise", href: "/music", icon: faMusic },
  { title: "Feeds", subtitle: "Latest updates", href: "/feeds", icon: faNewspaper },
];

const events = [
  { title: "Wednesday Equipping", subtitle: "Wednesdays 7:00 PM", icon: faCalendar },
  { title: "Prayer Gathering", subtitle: "Fridays 8:00 PM", icon: faPrayingHands },
  { title: "D-group Meeting", subtitle: "Saturdays 5:00 PM", icon: faUsers },
  { title: "Sunday Live Stream", subtitle: "Sundays 10:30 AM", icon: faVideo },
];

const Page = () => {
  const setHideNavbar = useSetHideNavbar();

  useEffect(() => {
    setHideNavbar(true);
    return () => setHideNavbar(false);
  }, [setHideNavbar]);

  return (
    <div className={styles.container}>
      <VerseOfTheDaySection />

      {/* 🔹 Upcoming Events Section */}
      <div className={styles.sectionWrapper}>
        <h2 className={styles.sectionHeader}>Upcoming Events</h2>
        <div className={styles.gridMenu}>
          {events.map((event, index) => (
            <motion.div
              key={event.title}
              className={styles.eventCard}
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
            >
              <FontAwesomeIcon icon={event.icon} className={styles.icon} />
              <div className={styles.textBlock}>
                <div className={styles.title}>{event.title}</div>
                <div className={styles.subtitle}>{event.subtitle}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🔹 Start Section */}
      <div className={styles.startWrapper}>
        <h2 className={styles.sectionHeader}>Start</h2>
        <div className={styles.startSection}>
          <FontAwesomeIcon icon={faBible} className={styles.startIcon} />
          <div className={styles.startText}>
            <div className={styles.startTitle}>Start my Conversation Time with God</div>
            <div className={styles.startSubtitle}>Go to Bible • Today's reading</div>
          </div>
          <a href="/bible" className={styles.startButton}>Begin</a>
        </div>
      </div>

      {/* 🔹 Menu Section */}
      <motion.div
        className={styles.menu}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.menuHeader}>Choose Your Next Step</div>
        <div className={styles.gridMenu}>
          {menuItems.map((item, index) => (
            <motion.a
              key={item.title}
              href={item.href}
              className={styles.gridItem}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
            >
              <FontAwesomeIcon icon={item.icon} className={styles.icon} />
              <div className={styles.textBlock}>
                <div className={styles.title}>{item.title}</div>
                <div className={styles.subtitle}>{item.subtitle}</div>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>

      <ActiveUsersSection />
    </div>
  );
};

export default Page;
