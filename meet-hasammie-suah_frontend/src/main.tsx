import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './lib/apolloClient';
import App from './App';
import './index.css';
import posthog from 'posthog-js';

// ── Posthog analytics ─────────────────────────────────────────────────────────
// Only initialises when VITE_POSTHOG_KEY is set in .env
// In development, leave the key blank — no data will be sent.
const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host:          import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    capture_pageview:  false,   // we handle this ourselves via usePageView
    capture_pageleave: true,    // records when a visitor leaves
    persistence:       'localStorage',
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
);
