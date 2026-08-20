import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
import './styles.css';
import './enhancements.css';
import { markOfflineReady, markUpdateError, setServiceWorkerRegistration } from './lib/pwaUpdate';

registerSW({
  immediate: true,
  onRegisteredSW(_serviceWorkerUrl, registration) {
    setServiceWorkerRegistration(registration);
  },
  onOfflineReady() {
    markOfflineReady();
  },
  onRegisterError(error) {
    markUpdateError(error);
  },
});

const root = document.getElementById('root');
if (!root) throw new Error('Root element was not found.');

createRoot(root).render(<StrictMode><App /></StrictMode>);
