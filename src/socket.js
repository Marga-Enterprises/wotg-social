// src/socket.js
import { io } from 'socket.io-client';

const socket = io(
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://community.wotgonline.com',
  {
    autoConnect: false,
  }
);

export default socket;
