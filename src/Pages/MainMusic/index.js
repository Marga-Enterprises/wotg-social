import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Styles
import styles from './index.module.css';

// Sections
import AlbumsSection from '../../sections/AlbumsSection';

const Page = () => {
    return (
        <div className={styles.page}>
            <div></div>
            <AlbumsSection />
        </div>
    )
}

export default Page;