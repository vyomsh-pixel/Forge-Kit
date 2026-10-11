import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Link } from 'react-router';
import ErrorBoundary from './components/ErrorBoundary';
import StudioAuthGate, { LegalDocumentPage } from './components/StudioAuthGate';
import './index.css';
import App from './App.jsx';

const WireframeStudio = lazy(() => import('./pages/WireframeStudio.jsx'));
const PromptStudio = lazy(() => import('./pages/PromptStudio.jsx'));
const CodeModifier = lazy(() => import('./pages/CodeModifier.jsx'));
const CMSStudio = lazy(() => import('./pages/CMSStudio.jsx'));

function StudioRouteFallback() {
  return (
    <div className="route-suspense-fallback" role="status" aria-live="polite">
      <div className="route-suspense-pill">Loading Studio Module...</div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/privacy',
    element: <LegalDocumentPage type="privacy" />,
  },
  {
    path: '/terms',
    element: <LegalDocumentPage type="terms" />,
  },
  {
    element: (
      <StudioAuthGate>
        <App />
      </StudioAuthGate>
    ),
    children: [
      { path: '/', element: <Navigate to="/wireframe" replace /> },
      {
        path: '/wireframe',
        element: (
          <Suspense fallback={<StudioRouteFallback />}>
            <WireframeStudio />
          </Suspense>
        ),
      },
      {
        path: '/prompt-ui',
        element: (
          <Suspense fallback={<StudioRouteFallback />}>
            <PromptStudio />
          </Suspense>
        ),
      },
      {
        path: '/code-modifier',
        element: (
          <Suspense fallback={<StudioRouteFallback />}>
            <CodeModifier />
          </Suspense>
        ),
      },
      {
        path: '/cms',
        element: (
          <Suspense fallback={<StudioRouteFallback />}>
            <CMSStudio />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h2>Page Not Found</h2>
            <p style={{ marginTop: '1rem' }}>
              <Link to="/wireframe" style={{ color: '#2a6f6f', fontWeight: 'bold' }}>
                Go to Wireframe Studio →
              </Link>
            </p>
          </div>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>
);