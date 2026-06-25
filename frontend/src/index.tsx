import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { PrintReportPage } from './pages/PrintReportPage';
import { PrintConsolidatedReportPage } from './pages/PrintConsolidatedReportPage';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const path = window.location.pathname;

if (path.startsWith('/print-report/')) {
  const eventId = path.split('/')[2];
  root.render(
    <React.StrictMode>
      <PrintReportPage eventId={eventId} />
    </React.StrictMode>
  );
} else if (path.startsWith('/print-consolidated-report')) {
  root.render(
    <React.StrictMode>
      <PrintConsolidatedReportPage />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
