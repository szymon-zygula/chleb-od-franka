import * as React from 'react';
import Button from '@material-ui/core/Button';
import Login from './login';
import Editor from './editor';
import Settings from './settings';
import formatPrice from './price';

enum Direction {
    Up,
    Down
}

export default class Admin extends React.Component<any, any> {
    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            logged: false,
            retail: [],
            wholesale: [],
            users: [],
            categories: [],
            editor: false,
            editorFields: null,
            editorAction: null,
            editorActionName: null,
            editorName: null,
            editorImage: false,
            editorFailed: false,
            editorBoxes: null,
            editorImageData: null,
            editorCategories: false,
            editorCategory: null
        };
    }

    componentWillMount() {
        this.updateData();
    }

    fixDataOrdering(data: any[]) {
        data = data.sort((a: any, b: any) => a.ord - b.ord);
        for(const i in data) {
            data[i].ord = parseInt(i);
        }

        if(data.length > 0 && data[0].category != null) {
            data = data.sort((a: any, b: any) => {
                const aOrd = this.state.categories.filter((x: any) => x.id === a.category)[0].ord;
                const bOrd = this.state.categories.filter((x: any) => x.id === b.category)[0].ord;
                if(a.category === b.category) {
                    return a.ord - b.ord;
                }

                return aOrd - bOrd;
            });
        }
    }

    fetchData = (url: string) => {
        fetch(Settings.apiEndpoint + '/' + url)
            .then(res => res.json())
            .then(res => {
                this.fixDataOrdering(res);
                this.setState({
                    [url]: res
                });
            });
    }

    async updateData() {
        fetch(Settings.apiEndpoint + '/users')
            .then(res => {
                this.setState({
                    logged: res.status === 200,
                });

                return res.json();
            })
            .then((res: any) => {
                this.setState({
                    users: res
                });
            })
            .catch((e: any) => {});

        this.fetchData('categories');
        this.fetchData('retail');
        this.fetchData('wholesale');
    }

    moveInOrder(dir: Direction, data: string, id: number) {
        let step: number;
        if(dir === Direction.Up) {
            step = -1;
        }
        else {
            step = 1;
        }

        const order = [];

        for(const i in this.state[data]) {
            order.push(this.state[data][i].id);
        }

        for(const i in order) {
            if(order[i] === id) {
                const swap = order[i];
                order[i] = order[parseInt(i) + step];
                order[parseInt(i) + step] = swap;
                break;
            }
        }

        fetch(
            Settings.apiEndpoint + '/' + data,
            {
                method: 'PUT',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ order })
            }
        )
            .then(() => {
                this.updateData();
            });
    }

    openEditor = (
        fields: object,
        method: string,
        path: string,
        actionName: string,
        name: string,
        image: boolean,
        requestReplace: object = {},
        boxes: boolean[] | null = null,
        imageData: string | null = null,
        categories: boolean = false,
        category: number | null = null
    ) => {
        this.setState({
            editor: true,
            editorImage: image,
            editorFields: fields,
            editorAction: (inputs: any) => {
                for(const i in requestReplace) {
                    const val = inputs[i];
                    delete inputs[i];
                    inputs[requestReplace[i]] = val;

                    if(requestReplace[i].search('piece_') >= 0) {
                        if(inputs[requestReplace[i]] === '') {
                            delete inputs[requestReplace[i]];
                        }
                    }
                }

                this.setState({
                    editorFailed: false
                });

                fetch(Settings.apiEndpoint + path, {
                    method,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(inputs)
                })
                .then(res => {
                    if(!res.ok) {
                        throw res;
                    }
                    else {
                        this.updateData();

                        this.setState({
                            editor: false
                        });
                    }
                })
                .catch(err => {
                    this.setState({
                        editorFailed: true
                    });
                })
            },
            editorActionName: actionName,
            editorName: name,
            editorFailed: false,
            editorBoxes: boxes,
            editorImageData: imageData,
            editorCategories: categories,
            editorCategory: category
        });
    }

    openAddEditor = (
        fields: string[],
        path: string,
        name: string,
        image: boolean,
        requestReplace: object = {},
        boxes: boolean[] | null = null,
        categories: boolean = false
    ) => {
        const editorFields = {};
        for(const field of fields) {
            editorFields[field] = '';
        }

        this.openEditor(editorFields, 'POST', path, 'Dodaj', name, image, requestReplace, boxes, null, categories);
    }

    openEditEditor = (
        fields: object,
        path: string,
        name: string,
        image: boolean,
        requestReplace: object = {},
        boxes: boolean[] | null = null,
        imageData: string | null = null,
        category: number | null = null
    ) => {
        this.openEditor(fields, 'PUT', path, 'Zapisz', name, image, requestReplace, boxes, imageData, category != null, category);
    }

    logout = () => {
        fetch(Settings.apiEndpoint + '/logout', {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(res => {
            this.setState({
                logged: false
            });
        });
    }

    deleteFrom = (path: string) => {
        fetch(Settings.apiEndpoint + path, {
            method: 'DELETE',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(() => this.updateData())
    }

    render() {
        let content;

        const users: any = [
            <tr key='head'>
                <th>
                    Id
                </th>
                <th>
                    Login
                </th>
            </tr>
        ];

        // User list
        for(const user of this.state.users) {
            users.push(
                <tr key={user.id}>
                    <td className='admin-cell'>
                        {user.id}
                    </td>
                    <td className='admin-cell'>
                        {user.login}
                    </td>
                    <td>
                        <Button
                            variant='contained'
                            onClick={() => this.deleteFrom('/users/' + user.id)}
                            className='admin-button'
                        >
                            Usuń
                        </Button>
                        <Button
                            variant='contained'
                            onClick={() => this.openEditEditor(
                                {
                                    ['Login']: user.login,
                                    ['Hasło']: user.password
                                },
                                '/users/' + user.id,
                                'Edytuj użytkownika',
                                false,
                                {
                                    'Login': 'login',
                                    'Hasło': 'password'
                                }
                            )}
                            className='admin-button'
                        >
                            Edytuj
                        </Button>
                    </td>
                </tr>
            );
        }

        const retails: any = [
            <tr key='head'>
                <th>Id</th>
                <th>Nazwa</th>
                <th>Składniki</th>
                <th>Masa</th>
                <th>Masa kawałka</th>
                <th>Cena</th>
                <th>Cena kawałka</th>
                <th>Część kawałka</th>
                <th>Wegańskie</th>
                <th>Bez glutenu</th>
                <th>Kategoria</th>
            </tr>
        ];

        // Retail list
        for(const retail of this.state.retail) {
            retails.push(
                <tr key={retail.id}>
                    <td className='admin-cell'>
                        {retail.id}
                    </td>
                    <td className='admin-cell'>
                        {retail.name}
                    </td>
                    <td className='admin-cell'>
                        {retail.ingredients}
                    </td>
                    <td className='admin-cell'>
                        {retail.mass}
                    </td>
                    <td className='admin-cell'>
                        {retail.piece_mass}
                    </td>
                    <td className='admin-cell'>
                        {formatPrice(retail.price)}
                    </td>
                    <td className='admin-cell'>
                        {formatPrice(retail.piece_price)}
                    </td>
                    <td className='admin-cell'>
                        {retail.piece_fraction}
                    </td>
                    <td className='admin-cell'>
                        {retail.vegan ? 'tak' : 'nie'}
                    </td>
                    <td className='admin-cell'>
                        {retail.gluten_free ? 'tak' : 'nie'}
                    </td>
                    <td className='admin-cell'>
                        {this.state.categories.filter((x: any) => retail.category === x.id)[0].name}
                    </td>
                    <td>
                        <div className='inline'>
                            <Button
                                variant='contained'
                                onClick={() => this.deleteFrom('/retail/' + retail.id)}
                                className='admin-button'
                            >
                                Usuń
                            </Button>
                            <Button
                                variant='contained'
                                onClick={() => this.openEditEditor(
                                    {
                                        'Nazwa': retail.name,
                                        'Składniki': retail.ingredients,
                                        'Masa (w gramach)': retail.mass,
                                        'Masa kawałka (opcjonalne)': retail.piece_mass == null ? '' : retail.piece_mass,
                                        'Cena (w groszach)': retail.price,
                                        'Cena za kawałek (opcjonalne)': retail.piece_price == null ? '' : retail.piece_price,
                                        'Część kawałka (opcjonalne, 1/n, np. 12 -> 1/12)': retail.piece_fraction == null ? '' : retail.piece_fraction
                                    },
                                    '/retail/' + retail.id,
                                    'Edytuj produkt detaliczny',
                                    true,
                                    {
                                        'Nazwa': 'name',
                                        'Składniki': 'ingredients',
                                        'Masa (w gramach)': 'mass',
                                        'Masa kawałka (opcjonalne)': 'piece_mass',
                                        'Cena (w groszach)': 'price' ,
                                        'Cena za kawałek (opcjonalne)': 'piece_price',
                                        'Część kawałka (opcjonalne, 1/n, np. 12 -> 1/12)': 'piece_fraction'
                                    },
                                    [retail.vegan, retail.gluten_free],
                                    retail.image,
                                    retail.category
                                )}
                                className='admin-button'
                            >
                                Edytuj
                            </Button>
                        </div>
                        <div className='inline'>
                            <Button
                                variant='contained'
                                onClick={() => this.moveInOrder(Direction.Up, 'retail', retail.id)}
                                className='admin-button'
                            >
                                ▲
                            </Button>
                            <Button
                                variant='contained'
                                onClick={() => this.moveInOrder(Direction.Down, 'retail', retail.id)}
                                className='admin-button'
                            >
                                ▼
                            </Button>
                        </div>
                    </td>
                </tr>
            );
        }

        const wholesales: any = [
            <tr key='head'>
                <th>Id</th>
                <th>Nazwa</th>
                <th>Składniki</th>
                <th>Masa</th>
                <th>Cena netto</th>
                <th>Cena brutto</th>
                <th>Stawka VAT</th>
                <th>Wegańskie</th>
                <th>Bez glutenu</th>
            </tr>
        ];

        // Wholesale list
        for(const wholesale of this.state.wholesale) {
            wholesales.push(
                <tr key={wholesale.id}>
                    <td className='admin-cell'>
                        {wholesale.id}
                    </td>
                    <td className='admin-cell'>
                        {wholesale.name}
                    </td>
                    <td className='admin-cell'>
                        {wholesale.ingredients}
                    </td>
                    <td className='admin-cell'>
                        {wholesale.mass}
                    </td>
                    <td className='admin-cell'>
                        {formatPrice(wholesale.netto)}
                    </td>
                    <td className='admin-cell'>
                        {formatPrice(wholesale.brutto)}
                    </td>
                    <td className='admin-cell'>
                        {wholesale.vat}%
                    </td>
                    <td className='admin-cell'>
                        {wholesale.vegan ? 'tak' : 'nie'}
                    </td>
                    <td className='admin-cell'>
                        {wholesale.gluten_free ? 'tak' : 'nie'}
                    </td>
                    <td className='admin-cell'>
                        {this.state.categories.filter((x: any) => wholesale.category === x.id)[0].name}
                    </td>
                    <td>
                        <div className='inline'>
                            <Button
                                variant='contained'
                                onClick={() => this.deleteFrom('/wholesale/' + wholesale.id)}
                                className='admin-button'
                            >
                                Usuń
                            </Button>
                            <Button
                                variant='contained'
                                onClick={() => this.openEditEditor(
                                    {
                                        'Nazwa': wholesale.name,
                                        'Składniki': wholesale.ingredients,
                                        'Masa (w gramach)': wholesale.mass,
                                        'Cena netto (w groszach)': wholesale.netto,
                                        'Cena brutto (w groszach)': wholesale.brutto,
                                        'Stawka VAT (w procentach)': wholesale.vat
                                    },
                                    '/wholesale/' + wholesale.id,
                                    'Edytuj produkt hurtowy',
                                    true,
                                    {
                                        'Nazwa': 'name',
                                        'Składniki': 'ingredients',
                                        'Masa (w gramach)': 'mass',
                                        'Cena netto (w groszach)': 'netto',
                                        'Cena brutto (w groszach)': 'brutto',
                                        'Stawka VAT (w procentach)': 'vat'
                                    },
                                    [wholesale.vegan, wholesale.gluten_free],
                                    wholesale.image,
                                    wholesale.category
                                )}
                                className='admin-button'
                            >
                                Edytuj
                            </Button>
                        </div>
                        <div className='inline'>
                            <Button
                                variant='contained'
                                onClick={() => this.moveInOrder(Direction.Up, 'wholesale', wholesale.id)}
                                className='admin-button'
                            >
                                ▲
                            </Button>
                            <Button
                                variant='contained'
                                onClick={() => this.moveInOrder(Direction.Down, 'wholesale', wholesale.id)}
                                className='admin-button'
                            >
                                ▼
                            </Button>
                        </div>
                    </td>
                </tr>
            );
        }

        const categories: any = [
            <tr key='head'>
                <th>
                    Id
                </th>
                <th>
                    Nazwa
                </th>
            </tr>
        ];

        // Categories list
        for(const category of this.state.categories) {
            categories.push(
                <tr key={category.id}>
                    <td className='admin-cell'>
                        {category.id}
                    </td>
                    <td className='admin-cell'>
                        {category.name}
                    </td>
                    <td>
                        <div className='inline'>
                            <Button
                                variant='contained'
                                onClick={() => this.deleteFrom('/categories/' + category.id)}
                                className='admin-button'
                            >
                                Usuń
                            </Button>
                            <Button
                                variant='contained'
                                onClick={() => this.openEditEditor(
                                    {
                                        'Nazwa': category.name
                                    },
                                    '/categories/' + category.id,
                                    'Edytuj kategorię',
                                    false,
                                    {
                                        'Nazwa': 'name'
                                    }
                                )}
                                className='admin-button'
                            >
                                Edytuj
                            </Button>
                        </div>
                        <div className='inline'>
                            <Button
                                variant='contained'
                                onClick={() => this.moveInOrder(Direction.Up, 'categories', category.id)}
                                className='admin-button'
                            >
                                ▲
                            </Button>
                            <Button
                                variant='contained'
                                onClick={() => this.moveInOrder(Direction.Down, 'categories', category.id)}
                                className='admin-button'
                            >
                                ▼
                            </Button>
                        </div>
                    </td>
                </tr>
            );
        }

        if(this.state.logged) {
            content = this.state.editor ?
                (<Editor
                    name={this.state.editorName}
                    action={this.state.editorActionName}
                    onAction={this.state.editorAction}
                    fields={this.state.editorFields}
                    onExit={() => this.setState({ editor: false })}
                    image={this.state.editorImage}
                    failed={this.state.editorFailed}
                    boxes={this.state.editorBoxes}
                    imageData={this.state.editorImageData}
                    categories={this.state.editorCategories ? this.state.categories : undefined}
                    category={this.state.editorCategory}
                />)
                :
                (<>
                    <Button variant='contained' onClick={this.logout} className='admin-button'>Wyloguj</Button>
                    <div id='admin-categories'>
                        <div id='admin-retail' className='admin-category'>
                            <div className='admin-head'>
                                <h2>Oferta detaliczna</h2>
                                <Button
                                    variant='contained'
                                    onClick={() => this.openAddEditor(
                                        [
                                            'Nazwa',
                                            'Składniki',
                                            'Masa (w gramach)',
                                            'Masa kawałka (opcjonalne)',
                                            'Cena (w groszach)',
                                            'Cena za kawałek (opcjonalne)',
                                            'Część kawałka (opcjonalne, 1/n, np. 12 -> 1/12)'
                                        ],
                                        '/retail',
                                        'Dodaj do oferty detalicznej',
                                        true,
                                        {
                                            'Nazwa': 'name',
                                            'Składniki': 'ingredients',
                                            'Masa (w gramach)': 'mass',
                                            'Masa kawałka (opcjonalne)': 'piece_mass',
                                            'Cena (w groszach)': 'price' ,
                                            'Cena za kawałek (opcjonalne)': 'piece_price',
                                            'Część kawałka (opcjonalne, 1/n, np. 12 -> 1/12)': 'piece_fraction'
                                        },
                                        [false, false],
                                        true
                                    )}
                                    className='admin-button'
                                >
                                    Dodaj
                                </Button>
                            </div>
                            <table>
                                <tbody>
                                    {retails}
                                </tbody>
                            </table>
                        </div>
                        <div id='admin-wholesale' className='admin-category'>
                            <div className='admin-head'>
                                <h2>Oferta hurtowa</h2>
                                <Button
                                    variant='contained'
                                    onClick={() => this.openAddEditor(
                                        [
                                            'Nazwa',
                                            'Składniki',
                                            'Masa (w gramach)',
                                            'Cena netto (w groszach)',
                                            'Cena brutto (w groszach)',
                                            'Stawka VAT (w procentach)'
                                        ],
                                        '/wholesale',
                                        'Dodaj do oferty hurtowej',
                                        true,
                                        {
                                            'Nazwa': 'name',
                                            'Składniki': 'ingredients',
                                            'Masa (w gramach)': 'mass',
                                            'Cena netto (w groszach)': 'netto',
                                            'Cena brutto (w groszach)': 'brutto',
                                            'Stawka VAT (w procentach)': 'vat'
                                        },
                                        [false, false],
                                        true
                                    )}
                                    className='admin-button'
                                >
                                    Dodaj
                                </Button>
                            </div>
                            <table>
                                <tbody>
                                    {wholesales}
                                </tbody>
                            </table>
                        </div>
                        <div id='admin-users' className='admin-category'>
                            <div className='admin-head'>
                                <h2>Użytkownicy</h2>
                                <Button
                                    variant='contained'
                                    onClick={() => this.openAddEditor(
                                        ['Login', 'Hasło'],
                                        '/users',
                                        'Dodaj użytkownika',
                                        false,
                                        {
                                            'Login': 'login',
                                            'Hasło': 'password'
                                        }
                                    )}
                                    className='admin-button'
                                >
                                    Dodaj
                                </Button>
                            </div>
                            <table>
                                <tbody>
                                    {users}
                                </tbody>
                            </table>
                        </div>
                        <div id='admin-categories' className='admin-category'>
                            <div className='admin-head'>
                                <h2>Kategorie</h2>
                                <Button
                                    variant='contained'
                                    onClick={() => this.openAddEditor(
                                        ['Nazwa'],
                                        '/categories',
                                        'Dodaj kategorię',
                                        false,
                                        {
                                            'Nazwa': 'name',
                                        }
                                    )}
                                    className='admin-button'
                                >
                                    Dodaj
                                </Button>
                            </div>
                            <table>
                                <tbody>
                                    {categories}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>);
        }
        else {
            content = <Login onLogin={() => {
                this.setState({
                    logged: true
                });

            fetch(Settings.apiEndpoint + '/users')
                .then(res => res.json())
                .then(res => {
                    this.setState({
                        users: res.sort((a: any, b: any) => a.id - b.id)
                    });
                })
                .catch((e: any) => {});
            }} />;
        }

        return (
            <div id='admin-cms'>
                {content}
            </div>
        );
    }
}
