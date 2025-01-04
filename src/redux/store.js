import { createStore, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
import reducers from './combineReducers';

const middleware = process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__
  ? compose(
      applyMiddleware(thunk),
      window.__REDUX_DEVTOOLS_EXTENSION__()
    )
  : compose(applyMiddleware(thunk));

const store = createStore(reducers, {}, middleware);

export default store;
