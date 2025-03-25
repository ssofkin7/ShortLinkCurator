import React from 'react';

// Using React.createElement instead of JSX
function Test() {
  return React.createElement(
    'div',
    null,
    React.createElement('h1', null, 'This is a test component')
  );
}

export default Test;