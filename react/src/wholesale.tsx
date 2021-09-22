import * as React from 'react';
import Settings from './settings';
import formatPrice from './price';
import LinearProgress from '@material-ui/core/LinearProgress';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import './css/product.css';

class Product extends React.Component<any, any> {
    render() {
        const netto = formatPrice(this.props.netto);
        const brutto = formatPrice(this.props.brutto);

        return (
            <div className='product-item'>
                <h3 className='product-name'>
                    <span>{this.props.name}</span>
                    {this.props.vegan ? <img src='/vegan.png' alt=' (Wegańskie)' /> : null}
                    {this.props.glutenFree ? <img src='/gluten_free.png' alt=' (Bez glutenu)' /> : null}
                </h3>
                <div className='product-content'>
                    <img alt={`${this.props.name} - obrazek`} src={'data:image;base64,' + this.props.image} />
                    <div className='product-description'>
                        <div className='product-ingredients'>{this.props.ingredients}</div>
                    <div className='product-price-mass'>
                        {this.props.mass} g
                    </div>
                    <div className='product-price-mass'>
                        {netto} zł netto
                        <br />
                        {brutto} zł brutto
                        <br />
                        ({this.props.vat}% VAT)
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default class Wholesale extends React.Component<any, any> {
    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            products: [],
            categories: [],
            category: null,
            tab: 0
        }
    }

    componentWillMount() {
        fetch(Settings.apiEndpoint + '/categories')
            .then(res => res.json())
            .then(res => {
                const categories = res.sort((a: any, b: any) => a.ord - b.ord);
                this.setState({
                    categories,
                    category: categories[0].id
                });

                fetch(Settings.apiEndpoint + '/wholesale?category=' + this.state.category)
                    .then(res => res.json())
                    .then(res => {
                        this.setState({
                            products: res.sort((a: any, b: any) => a.ord - b.ord)
                        });
                    });
            });
    }

    render() {
        const products = [];
        for(const i in this.state.categories) {
            for(const j in this.state.products) {
                const p = this.state.products[j];
                if(p.category == this.state.categories[i].id) {
                    products.push(
                        <Product
                            key={'c' + i + 'p' + j}
                            name={p.name}
                            ingredients={p.ingredients}
                            mass={p.mass}
                            netto={p.netto}
                            brutto={p.brutto}
                            vat={p.vat}
                            vegan={p.vegan}
                            glutenFree={p.gluten_free}
                            image={p.image}
                        />
                    );
                }
            }
        }

        const tabs = [];
        for(const t of this.state.categories) {
            tabs.push(<Tab key={t.id} label={t.name} />)
        }

        const items = [];
        for(const i in this.state.categories) {
            items.push(<MenuItem key={i} value={parseInt(i)}>{this.state.categories[i].name}</MenuItem>)
        }

        return (
            <div id='products'>
                <h1>Oferta hurtowa</h1>
                <div id='vg-con'>
                    <div id='vg-key'>
                        <div>
                            <img src='/vegan.png' alt=' (Wegańskie)' />
                            <span> - Produkt wegański</span>
                        </div>
                        <div>
                            <img src='/gluten_free.png' alt=' (Bez glutenu)' />
                            <span> - Produkt bez glutenu</span>
                        </div>
                    </div>
                </div>
                <Tabs id='products-tabs' value={this.state.tab} onChange={(e: any, value: number) => {
                    this.setState({
                        category: this.state.categories[value].id,
                        tab: value,
                        products: []
                    });

                    fetch(Settings.apiEndpoint + '/wholesale?category=' + this.state.categories[value].id)
                        .then(res => res.json())
                        .then(res => {
                            this.setState({
                                products: res.sort((a: any, b: any) => a.ord - b.ord)
                            });
                        });
                }}>
                    {tabs}
                </Tabs>
                {this.state.category === null ? null :
                    <FormControl id='products-select'>
                        <Select
                            value={this.state.tab}
                            onChange={(e: any) => {
                                const value = e.target.value;
                                this.setState({
                                    category: this.state.categories[value].id,
                                    tab: value,
                                    products: []
                                });

                            fetch(Settings.apiEndpoint + '/wholesale?category=' + this.state.categories[value].id)
                                    .then(res => res.json())
                                    .then(res => {
                                        this.setState({
                                            products: res.sort((a: any, b: any) => a.ord - b.ord)
                                        });
                                    });
                            }}
                            input={<Input name='category-products'/>}
                        >
                            {items}
                        </Select>
                    </FormControl>
                }
                {products}
                {products.length === 0 || this.state.categories.length === 0 ? 
                    <div id='progress-con'>
                        <LinearProgress id='progress' />
                    </div>
                : null}
            </div>
        );
    }
}
