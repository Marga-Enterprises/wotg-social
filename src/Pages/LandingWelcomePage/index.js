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
        <h2 className={styles.title}>Hi kapatid!</h2>
        <p className={styles.description}>
          Para mas madali ka naming makausap ng aming mga admin at 
          makasama sa community, buksan mo ang page na ito gamit ang browser 
          sa iyong phone.  
          Piliin lang ang isa sa mga button sa ibaba para lumipat.
        </p>

        {isAndroid && (
          <>
            <a
              className={`${styles.button} ${styles.btnChrome}`}
              href="intent://community.wotgonline.com/chat#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=https%3A%2F%2Fcommunity.wotgonline.com%2Fchat;end"
            >
              Buksan gamit ang Chrome
            </a>
            <a
              className={`${styles.button} ${styles.btnBrave}`}
              href="intent://community.wotgonline.com/chat#Intent;scheme=https;package=com.brave.browser;S.browser_fallback_url=https%3A%2F%2Fcommunity.wotgonline.com%2Fchat;end"
            >
              Buksan gamit ang Brave
            </a>
          </>
        )}

        <a
          className={`${styles.button} ${styles.btnDefault}`}
          href="https://community.wotgonline.com/chat"
          target="_blank"
        >
          Buksan sa Default Browser
        </a>

        {isIOS && (
          <p className={styles.note}>
            Kung iPhone o iPad ang gamit mo, automatic itong bubukas sa Safari.
          </p>
        )}
        {isAndroid && (
          <p className={styles.note}>
            Kapag hindi gumana ang Chrome o Brave, subukan ang “Default Browser”.
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;
