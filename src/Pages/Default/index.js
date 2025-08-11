import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./index.module.css";

// context
import { useSetHideNavbar } from "../../contexts/NavbarContext";

const Page = () => {
  const setHideNavbar = useSetHideNavbar();

  useEffect(() => {
      setHideNavbar(true);
      return () => setHideNavbar(false);
  }, [setHideNavbar]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.subtitle}>Oops! Page not found.</p>
      <Link to="/" className={styles.homeButton}>Go Back Home</Link>
    </div>
  );
};

export default Page;
