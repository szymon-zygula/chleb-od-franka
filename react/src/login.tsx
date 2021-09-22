import * as React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import Settings from './settings';

export default class Login extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            login: '',
            password: '',
            progress: false,
            failed: false
        };
    }

    handleChange(field: string) {
        return (event: any) => this.setState({
            [field]: event.target.value
        });
    }

    login = () => {
        this.setState({
            progress: true,
            failed: false
        });

        fetch(Settings.apiEndpoint + '/login', {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                login: this.state.login,
                password: this.state.password
            })
        })
            .then(res => {
                if(!res.ok) {
                    throw res;
                }

                this.setState({
                    progress: false
                });

                this.props.onLogin()
            })
            .catch(err => {
                this.setState({
                    progress: false,
                    failed: true
                });
            });
    }

    render() {
        return (
            <div id='login'>
                {
                    this.state.failed ?
                    <div id='login-failed'>
                        Logowanie nie udało się
                    </div>
                    : null
                }
                <TextField 
                    label='Login'
                    value={this.state.login}
                    onChange={this.handleChange('login')}
                />
                <TextField 
                    label='Hasło'
                    value={this.state.password}
                    type='password'
                    onChange={this.handleChange('password')}
                />
                <Button variant='contained' onClick={this.login} className='admin-button'>Zaloguj</Button>
                {
                    this.state.progress ?
                    <LinearProgress className='progress' />
                    : null
                }
            </div>
        );
    }
}
