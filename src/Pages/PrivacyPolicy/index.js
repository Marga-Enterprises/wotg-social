import styles from './index.module.css';

const Page = () => {
    return (
        <div className={styles.privacyContainer}>
            <h1 className={styles.title}>Privacy Policy</h1>
            <p className={styles.effectiveDate}>Effective Date: March 7, 2025</p>
            
            <section className={styles.section}>
                <h2>1. Introduction</h2>
                <p>Welcome to WOTG Community! Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our app.</p>
            </section>
            
            <section className={styles.section}>
                <h2>2. Information We Collect</h2>
                <ul>
                    <li>Personal Information (e.g., name, email, profile picture)</li>
                    <li>Usage Data (e.g., interactions, preferences, device information)</li>
                    <li>Cookies and Tracking Technologies</li>
                </ul>
            </section>
            
            <section className={styles.section}>
                <h2>3. How We Use Your Information</h2>
                <ul>
                    <li>To provide and improve our services</li>
                    <li>To communicate with you</li>
                    <li>To personalize user experience</li>
                    <li>To comply with legal obligations</li>
                </ul>
            </section>
            
            <section className={styles.section}>
                <h2>4. Sharing Your Information</h2>
                <p>We do not sell your personal information. However, we may share it with third-party service providers, legal authorities, or in case of business transfers.</p>
            </section>
            
            <section className={styles.section}>
                <h2>5. Data Security</h2>
                <p>We implement security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
            </section>
            
            <section className={styles.section}>
                <h2>6. Your Rights</h2>
                <p>You have the right to access, update, or delete your personal data. Contact us at support@wotgcommunity.com for requests.</p>
            </section>
            
            <section className={styles.section}>
                <h2>7. Changes to This Policy</h2>
                <p>We may update this policy from time to time. Changes will be posted on this page with a revised effective date.</p>
            </section>
        </div>
    );
};

export default Page;
