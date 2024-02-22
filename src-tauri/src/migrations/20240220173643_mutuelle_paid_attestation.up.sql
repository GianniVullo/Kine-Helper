alter table
    attestations
add
    column mutuelle_paid boolean not null default false;

ALTER TABLE
    attestations
ADD
    COLUMN patient_paid boolean not null default false;