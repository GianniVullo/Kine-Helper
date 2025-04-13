CREATE TABLE IF NOT EXISTS modification_history (
  id TEXT PRIMARY KEY,
  order_number BIGINT NOT NULL,
  created_at TEXT,
  -- data TEXT, cen'est pas nécessaire ici d'avoir les données une fois qu'elle ont été executées en local
  user_id TEXT
);
