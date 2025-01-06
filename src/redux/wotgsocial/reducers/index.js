import { combineReducers } from 'redux';

import user from './user';
import chatroom from './chatroom';
import message from './message';

const reducer = combineReducers({
  user,
  chatroom,
  message
});

export default reducer;