import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Render app first, then initialize Sentry after React is ready
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Initialize Sentry after React is mounted (async, non-blocking)
import('./lib/sentry').then(({ initSentry }) => {
  initSentry();
});
