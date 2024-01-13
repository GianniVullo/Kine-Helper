CREATE TABLE IF NOT EXISTS conventions (
    convention_id   TEXT PRIMARY KEY NOT NULL,
    titre           TEXT NOT NULL,
    documents       TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT '2023-06-01',
    year            INTEGER NOT NULL DEFAULT 2023,
    month           INTEGER NOT NULL DEFAULT 1,
    day             INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS codes (
    code_id             TEXT PRIMARY KEY NOT NULL,
    code_reference      TEXT,
    groupe              INTEGER,
    type                INTEGER,
    duree               INTEGER,
    lieu                INTEGER,
    amb_hos             TEXT,
    lourde_type         INTEGER,
    drainage            BOOLEAN,
    honoraire           REAL,
    coefficient         REAL,
    remboursement       TEXT, -- JSON
    valeur              TEXT,
    convention_id       TEXT,
    FOREIGN KEY(convention_id) REFERENCES conventions(convention_id) ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS kinesitherapeutes (
    id TEXT PRIMARY KEY,
    created_at TEXT,
    nom TEXT,
    prenom TEXT,
    adresse TEXT,
    cp INTEGER,
    localite TEXT,
    inami TEXT,
    tel TEXT,
    email TEXT,
    gsm TEXT,
    bce TEXT,
    iban TEXT,
    conventionne BOOLEAN,
    administrateur BOOLEAN,
    customer_id TEXT,
    subscription_id TEXT,
    migrated BOOLEAN,
    offre TEXT CHECK(offre IN ('free', 'cloud'))
);

CREATE TABLE IF NOT EXISTS patients (
    patient_id TEXT PRIMARY KEY,
    created_at TEXT,
    nom TEXT,
    prenom TEXT,
    niss TEXT,
    adresse TEXT,
    cp INTEGER,
    localite TEXT,
    date_naissance TEXT,
    tel TEXT,
    gsm TEXT,
    email TEXT,
    sexe TEXT,
    mutualite INTEGER,
    num_affilie TEXT,
    tiers_payant BOOLEAN,
    ticket_moderateur BOOLEAN,
    bim BOOLEAN,
    actif BOOLEAN,
    numero_etablissment TEXT,
    service TEXT,
    kinesitherapeute_id TEXT,
    FOREIGN KEY(kinesitherapeute_id) REFERENCES kinesitherapeutes(id)
);

CREATE TABLE IF NOT EXISTS situations_pathologiques (
    sp_id TEXT PRIMARY KEY,
    created_at TEXT,
    numero_etablissment TEXT,
    service TEXT,
    patient_id TEXT,
    user_id TEXT,
    motif TEXT,
    plan_du_ttt TEXT,
    intake BOOLEAN,
    with_indemnity BOOLEAN,
    rapport_ecrit BOOLEAN,
    rapport_ecrit_custom_date TEXT,
    rapport_ecrit_date TEXT CHECK(rapport_ecrit_date IN ('first', 'last', 'custom')),
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY(user_id) REFERENCES kinesitherapeutes(id)
);

CREATE TABLE IF NOT EXISTS documents (
    document_id TEXT PRIMARY KEY,
    created_at TEXT,
    patient_id TEXT,
    sp_id TEXT,
    form_data TEXT,
    user_id TEXT,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY(sp_id) REFERENCES situations_pathologiques(sp_id),
    FOREIGN KEY(user_id) REFERENCES kinesitherapeutes(id)
);

CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id TEXT PRIMARY KEY,
    created_at TEXT,
    patient_id TEXT,
    sp_id TEXT,
    date TEXT,
    active BOOLEAN,
    jointe_a TEXT,
    user_id TEXT,
    prescripteur TEXT,
    nombre_seance INTEGER,
    seance_par_semaine INTEGER,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY(sp_id) REFERENCES situations_pathologiques(sp_id),
    FOREIGN KEY(user_id) REFERENCES kinesitherapeutes(id)
);

CREATE TABLE IF NOT EXISTS generateurs_de_seances (
    created_at TEXT,
    auto BOOLEAN,
    groupe_id INTEGER,
    lieu_id INTEGER,
    duree INTEGER,
    examen_consultatif BOOLEAN,
    volet_j BOOLEAN,
    seconde_seance_fa BOOLEAN,
    duree_seconde_seance_fa INTEGER,
    nombre_code_courant_fa BOOLEAN,
    volet_h BOOLEAN,
    patho_lourde_type INTEGER,
    gmfcs INTEGER,
    seconde_seance_e BOOLEAN,
    premiere_seance TEXT,
    jour_seance_semaine_heures TEXT,
    deja_faites INTEGER,
    default_seance_description TEXT,
    nombre_seances INTEGER,
    sp_id TEXT,
    gen_id TEXT,
    date_presta_chir_fa TEXT,
    examen_ecrit_date TEXT,
    amb_hos TEXT CHECK(amb_hos IN ('AMB', 'HOS')),
    user_id TEXT,
    FOREIGN KEY(sp_id) REFERENCES situations_pathologiques(sp_id),
    FOREIGN KEY(gen_id) REFERENCES generateurs_de_seances(gen_id),
    FOREIGN KEY(user_id) REFERENCES kinesitherapeutes(id)
);


CREATE TABLE IF NOT EXISTS attestations (
    attestation_id TEXT PRIMARY KEY,
    created_at TEXT,
    patient_id TEXT,
    sp_id TEXT,
    porte_prescr BOOLEAN,
    numero_etablissment TEXT,
    service TEXT,
    has_been_printed BOOLEAN,
    prescription_id TEXT,
    total_recu REAL,
    valeur_totale REAL,
    user_id TEXT,
    with_indemnity BOOLEAN,
    with_intake BOOLEAN,
    date TEXT,
    with_rapport BOOLEAN,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY(sp_id) REFERENCES situations_pathologiques(sp_id),
    FOREIGN KEY(prescription_id) REFERENCES prescriptions(prescription_id),
    FOREIGN KEY(user_id) REFERENCES kinesitherapeutes(id)
);

CREATE TABLE IF NOT EXISTS seances (
    seance_id TEXT PRIMARY KEY,
    created_at TEXT,
    code_id TEXT,
    date TEXT,
    description TEXT,
    has_been_attested BOOLEAN,
    attestation_id TEXT,
    prescription_id TEXT,
    user_id TEXT,
    sp_id TEXT,
    patient_id TEXT,
    is_paid BOOLEAN,
    start TEXT,
    end TEXT,
    gen_id TEXT,
    FOREIGN KEY(attestation_id) REFERENCES attestations(attestation_id),
    FOREIGN KEY(prescription_id) REFERENCES prescriptions(prescription_id),
    FOREIGN KEY(user_id) REFERENCES kinesitherapeutes(id),
    FOREIGN KEY(sp_id) REFERENCES situations_pathologiques(sp_id),
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY(gen_id) REFERENCES generateurs_de_seances(gen_id)
);
