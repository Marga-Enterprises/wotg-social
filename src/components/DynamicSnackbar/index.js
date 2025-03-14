import React, { useEffect, useState } from "react";
import styles from "./index.module.css";

const DynamicSnackbar = ({ open, message, type, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            setTimeout(() => {
                setVisible(false);
                onClose();
            }, 3000); // Hide after 3 seconds
        }
    }, [open, onClose]);

    return (
        <div className={`${styles.snackbar} ${visible ? styles.show : ""} ${styles[type]}`}>
            {message}
        </div>
    );
};

export default DynamicSnackbar;
