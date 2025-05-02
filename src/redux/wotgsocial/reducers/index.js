import { combineReducers } from 'redux';

import user from './user';
import chatroom from './chatroom';
import message from './message';
import musicPlayer from './musicPlayer';

const reducer = combineReducers({
  user,
  chatroom,
  message,
  musicPlayer
});

export default reducer;