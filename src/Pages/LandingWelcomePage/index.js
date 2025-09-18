"use client";
import styles from './index.module.css';

const Page = () => {
  let isAndroid = false;
  let isIOS = false;

  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent || "";
    isAndroid = /Android/i.test(ua);
    isIOS = /iPhone|iPad|iPod/i.test(ua);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Buksan sa Browser</h2>
        <p className={styles.description}>
          Para mas maganda ang karanasan, buksan ang page na ito sa browser ng
          iyong phone.
        </p>

        {isAndroid && (
          <>
            <a
              className={styles.btnChrome}
              href="intent://community.wotgonline.com/chat#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=https%3A%2F%2Fcommunity.wotgonline.com%2Fchat;end"
            >
              Buksan sa Chrome
            </a>
            <a
              className={styles.btnBrave}
              href="intent://community.wotgonline.com/chat#Intent;scheme=https;package=com.brave.browser;S.browser_fallback_url=https%3A%2F%2Fcommunity.wotgonline.com%2Fchat;end"
            >
              Buksan sa Brave
            </a>
          </>
        )}

        <a
          className={styles.btnDefault}
          href="https://community.wotgonline.com/chat"
          target="_blank"
        >
          Buksan sa Default Browser
        </a>

        {isIOS && (
          <p className={styles.note}>
            Sa iPhone/iPad, ito ay bubukas sa Safari.
          </p>
        )}
        {isAndroid && (
          <p className={styles.note}>
            Kung hindi gumana ang Chrome o Brave, gamitin ang “Default Browser”.
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;
