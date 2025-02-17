-- c'est pour ajouter qu'il y a un rapport écrit, une indemnité de dplcmt, un intake, un tarif custom et/ou un supplément
ALTER TABLE
    seances
ADD
    COLUMN metadata TEXT;

ALTER TABLE
    situations_pathologiques
ADD
    COLUMN metadata TEXT;

-- une table pour les kinés déconventionnés
CREATE TABLE IF NOT EXISTS tarifs (
    id TEXT PRIMARY KEY,
    created_at TEXT,
    nom TEXT,
    valeur TEXT,
    user_id TEXT
);

-- pour les frais supplémentaires endurés par le kiné tel un forfait pour les week-ends ou encore sir le kiné a dû acheter des choses pour le patient ou fournir des consomables à charge du patient
CREATE TABLE IF NOT EXISTS supplements (
    id TEXT PRIMARY KEY,
    created_at TEXT,
    nom TEXT,
    valeur TEXT,
    user_id TEXT
);