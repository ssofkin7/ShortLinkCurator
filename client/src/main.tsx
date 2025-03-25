/* eslint-disable */
// Importing with aliased syntax for better preamble detection
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import './index.css';
import Minimal from './Minimal';

// Direct access to DOM element and simplified render
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Minimal />
    </React.StrictMode>
  );
}
