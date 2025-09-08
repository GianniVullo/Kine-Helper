use tauri_plugin_sql::{Migration, MigrationKind};

pub fn build_migrations() -> Vec<Migration> {
    vec![
                        Migration {
                            version: 0,
                            description: "Conventions",
                            sql: include_str!("migrations/20231204175351_conventions.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 1,
                            description: "Ajout de champs mutuelle_paid et patient_paid dans la table attestation",
                            sql: include_str!("migrations/20240220173643_mutuelle_paid_attestation.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 2,
                            description: "Ajout du docType à la table document",
                            sql: include_str!("migrations/20240220193637_docType.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 3,
                            description: "Typo sur la table patients",
                            sql: include_str!("migrations/20240305190432_renamepatient.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 4,
                            description: "Typo sur la table attestations",
                            sql: include_str!("migrations/20240307202642_typo2.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 5,
                            description: "Ajout de la table kines",
                            sql: include_str!("migrations/20240309173246_kine.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 6,
                            description: "Ajout de la column 9 pin à la table settings",
                            sql: include_str!("migrations/20240318145714_9pin.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 7,
                            description: "Ajout des dernières histoires à la table SP",
                            sql: include_str!("migrations/20240321080003_sp_with_group.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 8,
                            description: "Rename column kinesitherapeute_id to user_id for standardization in table patients",
                            sql: include_str!("migrations/20240906062350_rename_patients_kine_id.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 9,
                            description: "New tarification paradigma",
                            sql: include_str!("migrations/20250119121051_tarifs_et_supplement.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 10,
                            description: "Added Appareils table that will only be local to track the USB/Bluetooth devices linked to the machine",
                            sql: include_str!("migrations/20250216165021_appareils.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 11,
                            description: "Added column metadata to tables tarifs and supplements",
                            sql: include_str!("migrations/20250216165602_tarifs_metadata.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 12,
                            description: "Added missing column amb_hos to tables sp",
                            sql: include_str!("migrations/20250225195209_sp_amb_hos.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 13,
                            description: "Added control column to table seances",
                            sql: include_str!("migrations/20250306133523_seance_completion.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 14,
                            description: "Documents et Séances API Refonte + migration of seance and document tables",
                            sql: include_str!("migrations/20250316133523_migrate_data_and_document_refonte.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 15,
                            description: "Adding a kv store in the db",
                            sql: include_str!("migrations/20250325133523_kv_store.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 16,
                            description: "Adding the history node",
                            sql: include_str!("migrations/20250406133523_history_nodes.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 17,
                            description: "Remaniement de la colonne file_name de la table prescriptions pour supporter la fonction scanner",
                            sql: include_str!("migrations/20250406133523_history_nodes.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 18,
                            description: "Ajout d'un champ deja_faites à la table prescriptions pour les reprise de patients",
                            sql: include_str!("migrations/20250530133523_prescription_deja_faites.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 19,
                            description: "Ajout d'un champ payment_method à la table séances pour savoir comment l'argent a été payé",
                            sql: include_str!("migrations/20250530133523_seance_payment.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 20,
                            description: "Ajout de la table translations for i18n",
                            sql: include_str!("migrations/20250815133523_added_settings_and_i18n.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 21,
                            description: "Ajout des colonne ssin et metadata à la table kines",
                            sql: include_str!("migrations/20250815133523_added_ssin_for_kine.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 22,
                            description: "Ajout des colonne organization_id à la table business",
                            sql: include_str!("migrations/20250915133523_added_organization_id_to_business_table.up.sql"),
                            kind: MigrationKind::Up,
                        },
                    ]
}
