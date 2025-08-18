import { createRoot } from 'react-dom/client'; // ✅ use createRoot instead of ReactDOM.render
import './index.css';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
