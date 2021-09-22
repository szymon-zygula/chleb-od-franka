CREATE TABLE retail (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ingredients VARCHAR(1000) NOT NULL,
    mass INTEGER NOT NULL,
    price INTEGER NOT NULL,
    piece_fraction INTEGER,
    piece_mass INTEGER,
    piece_price INTEGER,
    vegan BOOLEAN NOT NULL,
    gluten_free BOOLEAN NOT NULL,
    image BYTEA NOT NULL
);
