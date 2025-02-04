
DROP TABLE IF EXISTS projects CASCADE;

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    target_amount INTEGER NOT NULL,
    current_amount INTEGER DEFAULT 0,
    event_date TIMESTAMP,
    location TEXT,
    creator_id INTEGER NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    invitation_token TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_details TEXT NOT NULL,
    fixed_amount_1 INTEGER,
    fixed_amount_2 INTEGER,
    fixed_amount_3 INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
