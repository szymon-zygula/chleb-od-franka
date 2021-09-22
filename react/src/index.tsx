import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';
declare module 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import './css/master.css';

ReactDOM.render(
    <BrowserRouter><App /></BrowserRouter>,
    document.getElementById('root') as HTMLElement
);
