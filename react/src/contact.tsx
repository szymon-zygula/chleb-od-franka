import * as React from 'react';

export default class Contact extends React.Component {
    render() {
        return (
            <React.Fragment>
                <h1 id='contact-header'>Kontakt</h1>
                <div className='contact'>
                <img id='contact-ear' alt='' src='/ear1.png' />
                    <p id='contact-desc'>
                        <strong>Chleb od Franka&nbsp;&nbsp;Sp. z o.o.</strong><br /><br />
                        Ul. Zakopiańska 73<br />
                        30-418 Kraków<br />
                        NIP: 6793170319<br /><br />
                        Tel. +48 577 755 669<br />
                        e-mail: biuro@chlebodfranka.pl<br />
                    </p>
                </div>
            </React.Fragment>
        );
    }
}
