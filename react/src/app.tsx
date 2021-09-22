import * as React from 'react';
import Header from './header';
import Main from './main';
import Footer from './footer';
import './css/app.css';

class App extends React.Component {
    public render() {
        return (
            <div id='app'>
                <Header />
                <Main />
                <Footer />
            </div>
        );
    }
}

export default App;
