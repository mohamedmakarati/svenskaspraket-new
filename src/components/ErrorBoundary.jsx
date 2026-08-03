import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary:', error?.message, info?.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="admin-error-boundary wrap section">
          <h1>Something went wrong</h1>
          <p>Please reload the page. If the problem persists, contact an administrator.</p>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
