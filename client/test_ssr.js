import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './src/App.jsx';

try {
    console.log("Starting SSR test...");
    const html = ReactDOMServer.renderToString(React.createElement(App));
    console.log("SSR test completed successfully! Length of HTML:", html.length);
} catch (e) {
    console.error("SSR test failed with error:");
    console.error(e);
    process.exit(1);
}
