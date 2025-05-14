import React, { useMemo, useState } from 'react';
import styles from './index.module.css';
import Cookies from 'js-cookie';

import NewPostModal from '../../../components/NewPostModal';

const NewPost = ({ triggerRefresh }) => {
    const backendUrl = useMemo(() => 'https://wotg.sgp1.cdn.digitaloceanspaces.com/images', []);
    const account = useMemo(() => Cookies.get('account'), []);

    const [openPostModal, setOpenPostModal] = useState(false);

    const parsedAccount = JSON.parse(account || '{}');

    return (
        <>
            {openPostModal && (
                <NewPostModal
                    user={parsedAccount}
                    onClose={() => setOpenPostModal(false)}
                    onRefresh={(newPost) => {
                        triggerRefresh(newPost);
                    }}
                />
            )}

            <div className={styles.newPostBox}>
                <div className={styles.inputRow}>
                    <img
                        alt="Profile"
                        src={
                            parsedAccount.user_profile_picture ? `${backendUrl}/${parsedAccount.user_profile_picture}` : 
                            'https://wotg.sgp1.cdn.digitaloceanspaces.com/images/profile_place_holder.webp'
                        }
                        className={styles.avatar}
                    />
                    <input
                        className={styles.input}
                        placeholder={`What's on your heart to share, ${parsedAccount.user_fname || 'Friend'}?`}
                        readOnly
                        onClick={() => setOpenPostModal(true)}
                    />
                </div>
                <hr className={styles.divider} />
            </div>
        </>

    );
};

export default React.memo(NewPost);
