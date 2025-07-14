CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    profile_picture_url VARCHAR(255),
    dietary_preferences JSONB DEFAULT '[]',
    allergies JSONB DEFAULT '[]',
    budget VARCHAR(50),
    cuisine_preferences JSONB DEFAULT '[]',
    sustainability_preferences JSONB DEFAULT '[]'
);
