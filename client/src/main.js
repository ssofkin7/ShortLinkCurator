import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Plain JavaScript without JSX
const app = React.createElement(
  'div',
  { 
    style: {
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'Arial',
      maxWidth: '600px',
      margin: '0 auto'
    } 
  },
  React.createElement('h1', null, 'LinkOrbit'),
  React.createElement('p', null, 'Organize your short-form content links efficiently')
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(app);