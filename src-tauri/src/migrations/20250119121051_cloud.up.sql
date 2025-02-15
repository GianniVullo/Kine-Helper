CREATE TABLE IF NOT EXISTS history_nodes (
    id TEXT PRIMARY KEY NOT NULL,
    node_type INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    author TEXT,
    payload TEXT,
    saved INTEGER DEFAULT 0
);

-- ça pourrait être intéressant d'avoir une table devices pour enregistrer les noms des machines du kiné. Pour l'instant je ne sais pas encore ce que j'en ferai mais 
-- Une table pour track les connections et déconnexions successfull pour s'assurer que 
CREATE TABLE IF NOT EXISTS tracking_unsuccessfull_disconnections (
    id TEXT PRIMARY KEY NOT NULL,
    logged_in_at TEXT NOT NULL,
    successfully_logged_out TEXT NOT NULL,
);

CREATE TABLE IF NOT EXISTS tracking_offline_connexions (
    id TEXT PRIMARY KEY NOT NULL,
    created_at TEXT NOT NULL,
);

CREATE TABLE IF NOT EXISTS equipes (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT,
    unformal_name TEXT,
    -- Parce que c'est sympa de s'appeler "Les potos du 6200" quand on a un cabinet à Chatelineau même si le cabinet s'appelle "Cabinet avec un nom ennuyeux pour que les gens sachent c'q'uon fait". Am I being cynical...
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(created_by) REFERENCES kines(user_id) ON DELETE CASCADE ON UPDATE NO ACTION
);

ALTER TABLE
    kines
ADD
    COLUMN niss TEXT;

CREATE TABLE IF NOT EXISTS appareils (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    metadata TEXT
);

-- on va déconstruire cette API Documents. C'est vraiment pas bien. Il faut faire des tables pour chacun des types de documents parce que là c'est vraiment n'importe quoi...
CREATE TABLE IF NOT EXISTS factures_patients (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    patient_id TEXT,
    sp_id TEXT,
    created_at TEXT,
    modified_at TEXT,
    date TEXT,
    form_data TEXT,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY(sp_id) REFERENCES situations_pathologiques(sp_id) ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS factures_patients_attestations ();
CREATE TABLE IF NOT EXISTS factures_mutuelles ();
CREATE TABLE IF NOT EXISTS factures_mutuelles_attestations ();

CREATE TABLE IF NOT EXISTS demandes_accord ();
CREATE TABLE IF NOT EXISTS testings ();
CREATE TABLE IF NOT EXISTS custom_documents ();
 