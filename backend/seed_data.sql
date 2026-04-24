-- Seed data for Task Management System
-- Run after migrations: sqlite3 tasks.db < seed_data.sql


INSERT INTO tasks (title, description, status) VALUES
  ('Set up project repository',    'Initialize Git repo, add .gitignore and README',          'completed'),
  ('Design database schema',       'Create ERD and define tables for the task system',         'completed'),
  ('Implement FastAPI backend',    'Build CRUD endpoints with SQLite and Alembic migrations',  'in-progress'),
  ('Write unit tests',             'Cover all endpoints including status transition edge cases','in-progress'),
  ('Build React frontend',         'Create task list, add/edit/delete UI with Axios calls',    'pending'),
  ('Generate OpenAPI SDK',         'Use openapi-generator-cli to generate Python SDK',         'pending'),
  ('Write README documentation',   'Step-by-step setup and execution guide',                   'pending'),
  ('Create batch setup scripts',   'setupdev.bat and runapplication.bat for Windows',          'pending'),
  ('Code review & cleanup',        'Refactor code, add docstrings, check linting',             'pending'),
  ('Final submission',             'Push to GitHub and submit the repository link',             'pending');
