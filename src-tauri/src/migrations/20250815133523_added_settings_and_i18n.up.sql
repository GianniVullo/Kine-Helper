Create Table IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY,
    created_at TEXT,
    version INTEGER,
    translation TEXT,
    code TEXT,
    is_default INTEGER DEFAULT FALSE
);