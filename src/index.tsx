import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';

import App from './App';
import reportWebVitals from './reportWebVitals';

// import awsconfig from "./aws-exports";
// 
import './index.css';
import '@aws-amplify/ui-react/styles.css';

// Amplify.configure(awsconfig);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <Authenticator.Provider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Authenticator.Provider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();