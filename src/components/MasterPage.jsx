import React from 'react';
import { Link } from 'react-router';

export default class MasterPage extends React.Component {
  render() {
    return (
      <div className="app-container">
        <header>
          <Link to="/">
            Hieno headeri
          </Link>
        </header>
        <div className="app-content">{this.props.children}</div>
        <footer>
          <p>
            Hieno footteri...
          </p>
        </footer>
      </div>
    );
  }
}