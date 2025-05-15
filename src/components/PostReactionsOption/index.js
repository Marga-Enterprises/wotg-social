import React from 'react';
import styles from './index.module.css';

const REACTIONS = [
  { label: 'Haha', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/haha.webp' },
  { label: 'Pray', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/pray.webp' },
  { label: 'Heart', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/heart.webp' },
  { label: 'Clap', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/clap.webp' },
  { label: 'Praise', src: 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/praise.webp' },
];

const ReactionPopup = ({ onMouseEnter, onMouseLeave, onReact }) => {
  return (
    <div
      className={styles.reactionPopup}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {REACTIONS.map((reaction) => (
        <img
          key={reaction.label}
          src={reaction.src}
          alt={reaction.label}
          title={reaction.label}
          className={styles.reactionImage}
          onClick={() => onReact(reaction)}
        />
      ))}
    </div>
  );
};

export default React.memo(ReactionPopup);
