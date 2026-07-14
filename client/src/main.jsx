import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Dynamically replace localhost:5000 with current hostname so it runs on mobile phones
axios.interceptors.request.use((config) => {
  if (config.url && config.url.includes('localhost:5000')) {
    config.url = config.url.replace('localhost:5000', `${window.location.hostname}:5000`);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
