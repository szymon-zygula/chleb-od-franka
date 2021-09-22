import * as React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

export default class Login extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            fields: this.props.fields,
            file: '',
            image: this.props.image ? this.props.imageData : null,
            vegan: this.props.boxes != null ? this.props.boxes[0] : null,
            gluten: this.props.boxes != null ? this.props.boxes[1] : null,
            category: this.props.category != null ? this.props.category : null
        }
    }

    handleChange(field: string) {
        return (event: any) => {
            const fields = this.state.fields;

            if(event.target) {
                fields[field] = event.target.value;
            }

            this.setState({
                fields
            });
        }
    }

    changeSelect = (event: any) => {
        this.setState({
            category: event.target.value
        });
    }

    addImage = (target: any) => {
        const reader = new FileReader();
        reader.readAsDataURL(target.files[0]);
        reader.onload = () => {
            const image = (reader.result as string).split(',')[1];
            this.setState({
                file: target.value.split('\\').slice(-1),
                image
            });
        };
    }

    onSend = () => {
        const fields = JSON.parse(JSON.stringify(this.state.fields));

        if(this.state.image != null) {
            fields.image = this.state.image;
        }

        if(this.state.vegan != null) {
            fields.vegan = this.state.vegan;
        }

        if(this.state.gluten != null) {
            fields.gluten_free = this.state.gluten;
        }

        if(this.state.category != null) {
            fields.category = this.state.category;
        }

        for(const i in fields) {
            if(!isNaN(parseInt(fields[i]))) {
                fields[i] = parseInt(fields[i]);
            }
        }

        this.props.onAction(fields);
    }

    render() {
        const fields = [];

        for(const i in this.props.fields) {
            fields.push(
                <TextField 
                    key={i}
                    label={i}
                    value={this.state.fields[i]}
                    onChange={this.handleChange(i)}
                />
            );
        }

        let items = [];
        if(this.props.categories != null) {
            for(const cat of this.props.categories) {
                items.push(
                    <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                    </MenuItem>
                )
            }
        }

        return (
            <div id='editor'>
                <h2>{this.props.name}</h2>
                {
                    this.props.failed ?
                    <div id='login-failed'>
                        Nie udało się wykonać operacji (Możliwe powody: puste pola, duplikat nazwy, brak połączenia z serwerem...)
                    </div>
                    : null
                }
                {fields}
                {this.props.categories != null ?
                    <FormControl>
                        <InputLabel shrink htmlFor='admin-select-category'>Kategoria</InputLabel>
                        <Select
                            value={this.state.category}
                            onChange={this.changeSelect}
                            input={<Input name='category' id='admin-select-category' />}
                        >
                            {items}
                        </Select>
                    </FormControl>
                : null}
                {this.props.boxes != null ?
                    <div className='boxes'>
                        <span>Wegańskie</span>
                        <Checkbox
                            color='primary'
                            checked={this.state.vegan}
                            onChange={() => this.setState({ vegan: !this.state.vegan })}
                        />
                        <span>Bez glutenu</span>
                        <Checkbox
                            color='primary'
                            checked={this.state.gluten}
                            onChange={() => this.setState({ gluten: !this.state.gluten })}
                        />
                    </div>
                : null}
                {this.props.image ?
                <div id='editor-image'>
                    <input
                        onInput={(event: any) => this.addImage(event.target)}
                        accept='image/*'
                        style={{ display: 'none' }}
                        id='button-file'
                        multiple
                        type='file'
                    />
                    <label htmlFor='button-file'>
                        <Button variant='contained' component='span' className='admin-button'>Dodaj zdjęcie</Button>
                    </label> 
                    <span id='editor-filename'>{this.state.file}</span>
                </div>
                : null}
                <Button variant='contained' onClick={this.onSend} className='admin-button'>{this.props.action}</Button>
                <Button variant='contained' onClick={this.props.onExit} className='admin-button'>Wróć</Button>
            </div>
        );
    }
}
