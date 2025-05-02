import { combineReducers } from 'redux';

import wotgsocial from './wotgsocial/reducers';
import common from './common/reducers';

const reducers = combineReducers({
  wotgsocial,
  common,
});

export default reducers;