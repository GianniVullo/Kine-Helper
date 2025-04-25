-- Migration to update the "file_name" column in the "prescription" table

UPDATE prescription
SET file_name = CONCAT('{ext: ', file_name, '}')
WHERE file_name IS NOT NULL;