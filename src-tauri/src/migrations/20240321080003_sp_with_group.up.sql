alter table situations_pathologiques add column groupe_id INTEGER;
alter table situations_pathologiques add column patho_lourde_type INTEGER;
alter table situations_pathologiques add column lieu_id INTEGER;
alter table situations_pathologiques add column duree INTEGER;
alter table situations_pathologiques add column volet_j BOOLEAN;
alter table situations_pathologiques add column volet_h BOOLEAN;
alter table situations_pathologiques add column gmfcs INTEGER;
alter table situations_pathologiques add column seconde_seance_fa BOOLEAN;
alter table situations_pathologiques add column seconde_seance_e BOOLEAN;
alter table situations_pathologiques add column duree_seconde_seance_fa INTEGER;
alter table situations_pathologiques add column deja_faites INTEGER DEFAULT 0;
alter table situations_pathologiques add column date_presta_chir_fa TEXT;