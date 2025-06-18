# SAE Associations - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
pipenv install
npm install
```

### 2. Environment Variables

**For Local Development:**
Create `.env` file in project root:

```
VITE_BACKEND_URL=http://localhost:3001
```

**For GitHub Codespaces:**

1. First start the backend to get the URL:
   ```bash
   pipenv run start
   ```
2. Copy the codespace URL that appears (like `https://xyz-3001.app.github.dev`)
3. Create `.env` file:
   ```
   VITE_BACKEND_URL=https://your-codespace-name-3001.app.github.dev
   ```

### 3. Database Setup

```bash
# Apply existing migrations
pipenv run upgrade
```

### 4. Start Development

```bash
# Backend (Flask)
pipenv run start

# Frontend (React) - new terminal
npm run dev
```

## Project Structure

```
src/
├── api/
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── controllers/     # Business logic
│   ├── services/        # Data access layer
│   └── schemas/         # Data validation
├── front/
│   ├── components/      # React components
│   ├── pages/           # React pages
│   ├── context/         # Global state
│   └── services/        # API calls
└── app.py              # Flask application
```

## API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/auth/info` - User profile info
- `POST /api/auth/register` - User registration
- `GET /api/events` - List events
- `POST /api/volunteers` - Register volunteer

## Main Models

- **User**: Authentication and profile data
- **Association**: Organization management
- **Event**: Event information and management
- **EventVolunteer**: Volunteer registration for events

## Troubleshooting

### Migration Issues in Codespaces

If you get migration errors in a new codespace:

```bash
# Clean ghost migrations from PostgreSQL
pipenv run python -c "
import os, psycopg2
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()
cur.execute('DELETE FROM alembic_version WHERE version_num NOT IN (SELECT substring(filename from 1 for 12) FROM (VALUES (\'[YOUR_CURRENT_MIGRATION_FILE_NAME].py\')) AS t(filename));')
conn.commit()
conn.close()
print('Ghost migrations cleaned')
"

# Apply current migrations
pipenv run upgrade
```

### Local vs Codespace Differences

- **Local**: Uses SQLite database (`database.db`)
- **Codespaces**: Uses PostgreSQL database
- **URLs**: Different between localhost and codespace domains
