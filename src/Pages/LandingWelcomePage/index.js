"use client";
import { useEffect, useState } from "react";
import styles from "./index.module.css";

const Page = () => {
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = "https://m.me/ate.dona.perez";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Paglilipat sa Admin</h2>

        <p className={styles.description}>
          Kapatid, ililipat ka namin sa isa sa ating admin upang mas mabigyan ka ng
          gabay at ma-assist ka nang maayos.  
          Sa ilang sandali ay ire-redirect ka namin sa Messenger ng aming admin.
        </p>

        <p className={styles.countdown}>
          Paglilipat sa loob ng {seconds} segundo...
        </p>

        <p className={styles.subtext}>
          Kung hindi ka ma-redirect, maaari mong i-click ang link sa ibaba.
        </p>

        <a
          className={styles.button}
          href="https://m.me/ate.dona.perez"
          target="_blank"
        >
          Buksan ang Messenger
        </a>
      </div>
    </div>
  );
};

export default Page;
