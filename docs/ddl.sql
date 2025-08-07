SET search_path TO calm_dev;

CREATE TABLE "audio" (
    id INTEGER NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    duration TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    source TEXT NOT NULL,
    lang TEXT NOT NULL,
    category TEXT NOT NULL,
    tab_category TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 10000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
