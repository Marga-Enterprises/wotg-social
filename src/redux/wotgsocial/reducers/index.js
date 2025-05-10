import { combineReducers } from 'redux';

import user from './user';
import chatroom from './chatroom';
import message from './message';
import musicPlayer from './musicPlayer';
import notification from './notification';

const reducer = combineReducers({
  user,
  chatroom,
  message,
  musicPlayer,
  notification
});

export default reducer;