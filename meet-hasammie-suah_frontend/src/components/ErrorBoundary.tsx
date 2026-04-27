/**
 * ErrorBoundary — catches unhandled React render errors so one broken
 * component can't crash the whole page.
 *
 * Why a class component?
 * Error boundaries MUST be class components in React. There is no hook
 * equivalent for componentDidCatch / getDerivedStateFromError — this is
 * one of the few remaining reasons to write a class component in modern React.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponentThatMightCrash />
 *   </ErrorBoundary>
 *
 *   // With a custom fallback:
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
import React from 'react';

interface Props {
  children:  React.ReactNode;
  fallback?: React.ReactNode;  // optional custom UI to show on error
}

interface State {
  hasError: boolean;
  error:    Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Called when a descendant throws during render.
  // Return value merges into state — this is how we flip into error mode.
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Called after the error is captured — good place to log to an error service.
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
    // TODO (when you add Posthog): posthog.capture('frontend_error', { error: error.message })
  }

  render() {
    if (this.state.hasError) {
      // If a custom fallback was passed in, use it
      if (this.props.fallback) return this.props.fallback;

      // Default fallback UI — matches the site's dark theme
      return (
        <div style={{
          minHeight:      '200px',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '12px',
          padding:        '2rem',
          background:     '#0F1A08',
          borderRadius:   '12px',
          border:         '1px solid rgba(212,175,55,0.15)',
          color:          '#F5F0E8',
          fontFamily:     'sans-serif',
        }}>
          <p style={{ fontSize: '15px', color: 'rgba(245,240,232,0.7)', margin: 0 }}>
            Something went wrong loading this section.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding:      '8px 20px',
              background:   'rgba(212,175,55,0.15)',
              border:       '1px solid rgba(212,175,55,0.3)',
              borderRadius: '8px',
              color:        '#D4AF37',
              cursor:       'pointer',
              fontSize:     '13px',
            }}
          >
            Try again
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              fontSize:   '11px',
              color:      'rgba(245,240,232,0.35)',
              maxWidth:   '100%',
              overflow:   'auto',
              margin:     0,
              whiteSpace: 'pre-wrap',
            }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
