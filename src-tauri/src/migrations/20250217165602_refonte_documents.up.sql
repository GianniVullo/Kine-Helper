CREATE TABLE IF NOT EXISTS factures (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    patient_id TEXT,
    sp_id TEXT,
    date TEXT,
    type TEXT,
    total TEXT,
    metadata TEXT,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY(sp_id) REFERENCES situations_pathologiques(sp_id) ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS factures_attestations (
    facture_id TEXT,
    attestation_id TEXT,
    PRIMARY KEY (facture_id, attestation_id),
    FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (attestation_id) REFERENCES attestations(attestation_id) ON DELETE CASCADE ON UPDATE NO ACTION
);

-- devraient contenir les réponses papiers des mutuelles en attendant eAgreement
CREATE TABLE IF NOT EXISTS accords (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    patient_id TEXT,
    sp_id TEXT,
    created_at TEXT,
    -- pexpl 3a (annexe A) 51 (Annexe B) J (patho E)
    situation INTEGER,
    valid_from TEXT,
    valid_to TEXT,
    reference TEXT,
    buildable INTEGER,
    binary TEXT,
    metadata TEXT
);

-- Insert data into factures table from documents table where docType is 8 or 9
INSERT INTO
    factures (
        id,
        user_id,
        patient_id,
        sp_id,
        date
        type,
        total
    )
SELECT
    document_id,
    user_id,
    patient_id,
    sp_id,
    json_extract(form_data, '$.date'),
    CASE
        WHEN docType = 8 THEN 'patient'
        WHEN docType = 9 THEN 'mutuelle'
    END,
    CASE
        WHEN docType = 8 THEN json_extract(form_data, '$.total')
        WHEN docType = 9 THEN json_extract(form_data, '$.tableRows[0].total')
    END
FROM
    documents
WHERE
    docType IN (8, 9);

INSERT INTO
    factures_attestations (facture_id, attestation_id)
SELECT
    document_id,
    json_each.value
FROM
    documents,
    json_each(json_extract(form_data, '$.attestationsIds'))
WHERE
    docType IN (8, 9);

-- Insert data into accords table from documents table where docType is 0 or 1
INSERT INTO
    accords (
        id,
        user_id,
        patient_id,
        sp_id,
        date,
        situation,
        validity,
        reference,
        buildable,
        binary,
        metadata
    )
SELECT
    document_id,
    user_id,
    patient_id,
    sp_id,
    json_extract(form_data, '$.date'),
    json_extract(form_data, '$.situation_pathologique'),
    NULL,
    NULL,
    TRUE,
    NULL,
    CASE
        WHEN docType = 0 THEN NULL
        WHEN docType = 1 THEN '{"notification": ' || json_extract(form_data, '$.notification') || '}'
    END
FROM
    documents
WHERE
    docType IN (0, 1);

DROP TABLE IF EXISTS documents;