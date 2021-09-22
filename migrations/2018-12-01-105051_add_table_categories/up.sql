CREATE TABLE categories(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    ord INTEGER NOT NULL
);

ALTER TABLE wholesale ADD COLUMN category INTEGER REFERENCES categories NOT NULL;
ALTER TABLE retail ADD COLUMN category INTEGER REFERENCES categories NOT NULL;

ALTER TABLE wholesale ADD COLUMN ord INTEGER NOT NULL;
ALTER TABLE retail ADD COLUMN ord INTEGER NOT NULL;

CREATE UNIQUE INDEX wholesale_name ON wholesale (name);
CREATE UNIQUE INDEX retail_name ON retail (name);

ALTER TABLE wholesale ADD CONSTRAINT wholesale_unique_name UNIQUE USING INDEX wholesale_name;
ALTER TABLE retail ADD CONSTRAINT retail_unique_name UNIQUE USING INDEX retail_name;
