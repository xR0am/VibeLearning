-- Drop existing tables if they exist
DROP TABLE IF EXISTS course_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions;

-- Create sessions table
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IDX_session_expire ON sessions (expire);

-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  profile_image_url TEXT,
  openrouter_api_key TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tags table
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Create courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  context TEXT NOT NULL,
  content JSONB NOT NULL,
  model_used TEXT NOT NULL,
  user_id TEXT REFERENCES users(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create course_tags table
CREATE TABLE course_tags (
  course_id INTEGER NOT NULL REFERENCES courses(id),
  tag_id INTEGER NOT NULL REFERENCES tags(id),
  PRIMARY KEY (course_id, tag_id)
);