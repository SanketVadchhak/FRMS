import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/globals.css';
import './styles/theme.css';
import './styles/animations.css';

import { registerSearchProviders } from './lib/search/registry';

registerSearchProviders();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
