CREATE TABLE IF NOT EXISTS kines (
  user_id TEXT PRIMARY KEY,
  nom TEXT,
  prenom TEXT,
  inami TEXT,
  bce TEXT,
  iban TEXT,
  adresse TEXT,
  cp INTEGER,
  localite TEXT,
  conventionne BOOLEAN
);