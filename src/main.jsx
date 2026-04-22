import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Expose sign-in helper for Playwright emulator tests
if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  import('firebase/auth').then(({ getAuth, signInWithEmailAndPassword }) => {
    window.__testSignIn = (email, password) =>
      signInWithEmailAndPassword(getAuth(), email, password);
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
