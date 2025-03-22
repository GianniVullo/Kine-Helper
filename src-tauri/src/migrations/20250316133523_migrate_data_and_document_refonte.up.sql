--* Step 1: Infer the code informations to the seances
UPDATE
    seances
SET
    indemnite = CASE
        WHEN seances.attestation_id IS NOT NULL THEN (
            SELECT
                a.with_indemnity
            FROM
                attestations a
            WHERE
                a.attestation_id = seances.attestation_id
        )
        ELSE CASE
            WHEN (
                SELECT
                    sp.with_indemnity
                FROM
                    situations_pathologiques sp
                WHERE
                    sp.sp_id = seances.sp_id
            ) IN ('true', 1) THEN 1
            ELSE 0
        END
    END,
    ticket_moderateur = (
        SELECT
            a.ticket_moderateur
        FROM
            patients a
        WHERE
            a.patient_id = seances.patient_id
    ),
    seance_type = (
        SELECT
            CASE
                -- séance de kiné
                WHEN a.type IN (0, 1, 2) THEN 0 -- séance à titre consultitative
                WHEN a.type = 4 THEN 1 -- seconde séance par jour
                WHEN a.type = 5 THEN 3
                ELSE 0
            END
        FROM
            codes a
        WHERE
            a.code_id = seances.code_id
    ),
    groupe_id = (
        SELECT
            a.groupe
        FROM
            codes a
        WHERE
            a.code_id = seances.code_id
    ),
    lieu_id = (
        SELECT
            a.lieu
        FROM
            codes a
        WHERE
            a.code_id = seances.code_id
    ),
    patho_lourde_type = (
        SELECT
            a.lourde_type
        FROM
            codes a
        WHERE
            a.code_id = seances.code_id
    ),
    duree = (
        SELECT
            a.duree
        FROM
            codes a
        WHERE
            a.code_id = seances.code_id
    );

WITH ranked_seances AS (
    SELECT
        seances.seance_id,
        seances.attestation_id,
        ROW_NUMBER() OVER (
            PARTITION BY seances.attestation_id
            ORDER BY
                seances.seance_id
        ) AS rn,
        a.with_intake,
        a.with_rapport
    FROM
        seances
        JOIN attestations a ON seances.attestation_id = a.attestation_id
)
UPDATE
    seances
SET
    metadata = CASE
        WHEN (
            SELECT
                rn
            FROM
                ranked_seances rs
            WHERE
                rs.seance_id = seances.seance_id
        ) = 1
        AND (
            SELECT
                with_intake
            FROM
                ranked_seances rs
            WHERE
                rs.seance_id = seances.seance_id
        ) IN ('true', 1) -- Accept both 'true' and 1
        THEN json_set(
            COALESCE(seances.metadata, '{}'),
            '$.intake',
            true
        )
        ELSE seances.metadata
    END,
    rapport_ecrit = CASE
        WHEN (
            SELECT
                rn
            FROM
                ranked_seances rs
            WHERE
                rs.seance_id = seances.seance_id
        ) = 1
        AND (
            SELECT
                with_rapport
            FROM
                ranked_seances rs
            WHERE
                rs.seance_id = seances.seance_id
        ) IN ('true', 1) -- Accept both 'true' and 1
        THEN 1
        ELSE seances.rapport_ecrit
    END;

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
    date TEXT,
    -- pexpl 3a (annexe A) 51 (Annexe B) J (patho E)
    situation TEXT,
    validity TEXT,
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
        date,
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
    CASE
        WHEN docType = 0 THEN CASE
            json_extract(form_data, '$.situation_pathologique')
            WHEN 0 THEN '1.'
            WHEN 1 THEN '2.'
            WHEN 2 THEN '2B.'
            WHEN 3 THEN '3.'
            WHEN 4 THEN '3B.'
            WHEN 5 THEN '4.'
            WHEN 6 THEN '5.'
            WHEN 7 THEN '6.'
            WHEN 8 THEN '7.'
            WHEN 9 THEN '8.'
            WHEN 10 THEN '9.'
            WHEN 11 THEN '10.'
            WHEN 12 THEN '11.'
            WHEN 13 THEN '12.'
            WHEN 14 THEN '13.'
            WHEN 15 THEN '14.'
            WHEN 16 THEN '15.'
            WHEN 17 THEN '16.'
            WHEN 18 THEN '17.'
        END
        WHEN docType = 1 THEN CASE
            json_extract(form_data, '$.situation_pathologique')
            WHEN 0 THEN '51.'
            WHEN 1 THEN '59.'
            WHEN 2 THEN '54.'
            WHEN 3 THEN '55.'
            WHEN 4 THEN '56.'
            WHEN 5 THEN '57.'
            WHEN 6 THEN '58.'
            WHEN 7 THEN '60.'
        END
    END,
    NULL,
    NULL,
    TRUE,
    NULL,
    CASE
        WHEN docType = 0 THEN '{"doc": "A"}'
        WHEN docType = 1 THEN '{"doc": "B", "notification": ' || json_extract(form_data, '$.notification') || '}'
    END
FROM
    documents
WHERE
    docType IN (0, 1);