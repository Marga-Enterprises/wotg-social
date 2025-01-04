import { combineReducers } from 'redux';

import ui from './ui';

const commonReducer = combineReducers({
  ui,
});

export default commonReducer;