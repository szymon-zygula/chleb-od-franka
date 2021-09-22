DROP INDEX IF EXISTS retail_name;
DROP INDEX IF EXISTS wholesale_name;

ALTER TABLE retail DROP CONSTRAINT IF EXISTS retail_unique_name;
ALTER TABLE wholesale DROP CONSTRAINT IF EXISTS wholesale_unique_name;

ALTER TABLE retail DROP COLUMN ord;
ALTER TABLE wholesale DROP COLUMN ord;

ALTER TABLE retail DROP COLUMN category;
ALTER TABLE wholesale DROP COLUMN category;

DROP TABLE categories;
