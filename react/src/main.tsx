import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import Wholesale from './wholesale';
import Retail from './retail';
import About from './about';
import Contact from './contact';
import Admin from './admin';
import './css/main.css';

export default class Main extends React.Component {
    render() {
        return (
            <div id='main'>
                <Switch>
                    <Route path='/' exact={true} component={About} />
                    <Route path='/retail' component={Retail} />
                    <Route path='/wholesale' component={Wholesale} />
                    <Route path='/contact' component={Contact} />
                    <Route path='/admin' component={Admin} />
                </Switch>
            </div>
        );
    }
}
