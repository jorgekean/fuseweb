import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import the PWA registration helper
import { registerSW } from 'virtual:pwa-register';

import { BrowserRouter } from "react-router-dom"
import GlobalContextProvider from './context/GlobalContext.tsx'

import { Toaster } from 'react-hot-toast'
import GenericModal from './components/modals/GenericModal.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { MsalProvider } from '@azure/msal-react'
import { AuthenticationResult, EventType, PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './utils/auth.config.ts'

import { Buffer } from 'buffer';// use by azure/cosmos for bulk operations

// Attach Buffer to the global object
window.Buffer = Buffer;

const msalInstance = new PublicClientApplication(msalConfig);

// Account selection logic is app dependent. Adjust as needed for different use cases.
const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}
/**
 * To set an active account after the user signs in, register an event and listen to LOGIN_SUCCESS & LOGOUT_SUCCES. For more,
 * visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/events.md
 */
msalInstance.addEventCallback((event) => {
  const authenticationResult = event.payload as AuthenticationResult
  const account = authenticationResult?.account;
  if (event.eventType === EventType.LOGIN_SUCCESS && account) {
    console.log('Active account set to: ', account);
    msalInstance.setActiveAccount(account);
  }

  if (event.eventType === EventType.LOGOUT_SUCCESS) {
    if (msalInstance.getAllAccounts().length > 0) {
      msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
    }
  }

  if (event.eventType === EventType.LOGIN_FAILURE) {
    console.log(JSON.stringify(event));
  }
});

// Optional: Register with callbacks for updates
const updateSW = registerSW({
  onNeedRefresh() {
    // For example, show a prompt to the user to refresh the page.
    console.log('New content available; please refresh.');
  },
  onOfflineReady() {
    // Notify the user that the app is ready to work offline.
    console.log('App ready to work offline.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <ThemeProvider>
        <GlobalContextProvider>
          <GenericModal></GenericModal>
          <BrowserRouter>
            <Toaster position='top-right' />
            <App />
          </BrowserRouter>
        </GlobalContextProvider>
      </ThemeProvider>
    </MsalProvider>
  </StrictMode>,
)
