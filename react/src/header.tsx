import * as React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Icon from '@material-ui/core/Icon';
import './css/header.css';
import { Redirect } from 'react-router-dom';

export default class Header extends React.Component<any, any> {
    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            location: window.location.pathname,
            anchorEl: null,
            b: 1
        };
    }

    openMenu(event: any) {
        if(event.currentTarget) {
            this.setState({ anchorEl: event.currentTarget });
        };
    }

    closeMenu() {
        this.setState({
            anchorEl: null
        });
    }

    setLocation(path: string) {
        return () => {
            this.setState({
                location: path,
                anchorEl: null
            });
        };
    }

    render() {
        let redirect: any | undefined = undefined;

        if(window.location.pathname !== this.state.location) {
            redirect = <Redirect to={this.state.location} />
        }

        const { anchorEl } = this.state;

        return (
            <div id='header'>
                <div className='header-separator'></div>
                <div id='nav'>
                    <div className='logo-container'>
                        <img id='logo' alt='logo' src='/logo3.png' />
                    </div>
                    <Menu
                        id='menu-nav'
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => this.closeMenu()}
                    >
                        <MenuItem onClick={this.setLocation('/')}>O nas</MenuItem>
                        <MenuItem onClick={this.setLocation('/retail')}>Oferta detaliczna</MenuItem>
                        <MenuItem onClick={this.setLocation('/wholesale')}>Oferta hurtowa</MenuItem>
                        <MenuItem onClick={this.setLocation('/contact')}>Kontakt</MenuItem>
                    </Menu>
                    <Button variant='outlined' onClick={e => this.openMenu(e)} id='menu-button'>
                        <Icon>menu</Icon>
                    </Button>
                    <div id='nav-buttons'>
                        <Button variant='outlined' onClick={this.setLocation('/')} className='nav-button'>O nas</Button>
                        <Button variant='outlined' onClick={this.setLocation('/retail')} className='nav-button'>Oferta detaliczna</Button>
                        <Button variant='outlined' onClick={this.setLocation('/wholesale')} className='nav-button'>Oferta hurtowa</Button>
                        <Button variant='outlined' onClick={this.setLocation('/contact')} className='nav-button'>Kontakt</Button>
                    </div>
                </div>
                <div className='header-separator'></div>
                <div id='banner'></div>
                {redirect}
            </div>
        );
    }
}
