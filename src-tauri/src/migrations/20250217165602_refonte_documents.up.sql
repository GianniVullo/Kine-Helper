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

-- devraient contenir les réponses papiers des mutuelles en attendant eAgreement
CREATE TABLE IF NOT EXISTS demandes_accord (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    patient_id TEXT,
    sp_id TEXT,
    created_at TEXT,
    validity TEXT,
    reference TEXT,
    buildable INTEGER, -- ce champ indique si les metadatas
    metadata
);

CREATE TABLE IF NOT EXISTS demandes_reconduction ();

CREATE TABLE IF NOT EXISTS testings ();

CREATE TABLE IF NOT EXISTS custom_documents ();