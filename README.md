# GameVault

Game collection tracker. Flask API + React frontend.

## Site Link

- Backend hosted on pythonanywhere and frontend hosted using github pages. 

https://xerx81.github.io/gamevault/

## Structure

```
gamevault/
├── backend
│   ├── app.py
│   ├── auth_utils.py
│   ├── database.py
│   ├── gamevault.db
│   ├── requirements.txt
│   └── routes
│       ├── auth.py
│       ├── games.py
│       └── __init__.py
├── frontend
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── src
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── components
│   │   │   ├── GameCard.jsx
│   │   │   └── GameForm.jsx
│   │   ├── hooks
│   │   │   └── useAuth.jsx
│   │   ├── main.jsx
│   │   ├── pages
│   │   │   ├── AuthPage.jsx
│   │   │   └── Dashboard.jsx
│   │   └── utils
│   │       └── api.js
│   └── vite.config.js
└── README.md
```

## Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate 
pip install -r requirements.txt
python app.py
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

## API

| Method | Endpoint              | Auth | Description          |
|--------|-----------------------|------|----------------------|
| POST   | /api/auth/signup      | —    | Register             |
| POST   | /api/auth/login       | —    | Login → JWT          |
| GET    | /api/auth/me          | ✓    | Current user         |
| GET    | /api/games            | ✓    | List games           |
| POST   | /api/games            | ✓    | Add game             |
| PUT    | /api/games/:id        | ✓    | Update game          |
| DELETE | /api/games/:id        | ✓    | Delete game          |

## Future Improvement
- Rate Limiting
- Pagination
