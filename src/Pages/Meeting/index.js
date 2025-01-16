import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';

import Cookies from 'js-cookie';

import styles from './index.module.css';

const Page = () => {
  const dispatch = useDispatch();

  const [roomname, setRoomname] = useState();
  const [email, setEmail] = useState();

  const cookieEmail = Cookies.get('email');

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      roomname,
      email,
    };

    dispatch(wotgsocial.meetingroom.accessMeetingroomAction(payload)).then((res) => {
        if (res.success) {
            window.location.href = res.data.jitsiUrl;
        } else {
            console.error('An error occurred while creating room:', res.payload);
        }
    }); 
  };

  return (
    <>
        <div className={styles.meetingContainer}> 
            <form className={styles.joinMeetingRoomForm} onSubmit={handleSubmit}>
                <h1>Join Room</h1>
                <input
                    type="text"
                    placeholder="Room name"
                    value={roomname}
                    className={styles.roomnameInput}
                    onChange={(e) => setRoomname(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    className={styles.roomnameInput}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit">Create Room</button>
            </form>
        </div>
    </>
  );
};

export default Page;