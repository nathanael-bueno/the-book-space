import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import CookieConsentBanner from './components/ui/CookieConsentBanner'
import { AuthProvider } from './stores/authStore'
import { LoadingProvider } from './stores/loadingStore'
import { NotificationProvider } from './stores/notificationStore'
import { ToastProvider } from './stores/toastStore'
import './assets/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoadingProvider>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <RouterProvider router={router} />
            <CookieConsentBanner />
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </LoadingProvider>
  </StrictMode>
)
