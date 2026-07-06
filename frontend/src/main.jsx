import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import Bootstrap JS (optional - สำหรับ dropdown, modal, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
