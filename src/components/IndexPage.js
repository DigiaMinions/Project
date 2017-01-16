import React from 'react';
import { Link } from 'react-router';

export default class IndexPage extends React.Component {
  render() {
    return (
      <div className="home">
        <h2>Se elää...ehkä?</h2>
        <p>
          <Link to="/">Linkki johonkin...</Link>
        </p>
      </div>
    );
  }
}