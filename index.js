import React from 'react';
import ReactDOM from 'react-dom/client'; // React 18
import './index.css';
import App from './App'; // Assurez-vous que App est importé correctement
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
