import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { error: /** @type {Error|null} */ (null) };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="wrap section empty" role="alert">
        <h1>Une erreur est survenue</h1>
        <p>La page n'a pas pu s'afficher. Vous pouvez réessayer.</p>
        <button type="button" className="btn" onClick={() => this.setState({ error: null })}>
          Réessayer
        </button>
      </div>
    );
  }
}
