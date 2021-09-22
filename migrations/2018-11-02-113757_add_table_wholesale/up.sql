CREATE TABLE wholesale (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ingredients VARCHAR(1000) NOT NULL,
    mass INTEGER NOT NULL,
    netto INTEGER NOT NULL,
    brutto INTEGER NOT NULL,
    vat INTEGER NOT NULL,
    vegan BOOLEAN NOT NULL,
    gluten_free BOOLEAN NOT NULL,
    image BYTEA NOT NULL
);
