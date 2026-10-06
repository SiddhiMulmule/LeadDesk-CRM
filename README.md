# LeadDesk CRM V3

Premium full-stack lead management CRM built with React + Vite, Node.js + Express and MongoDB.

## Stack

- React 19 + Vite
- React Router
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- Helmet + rate limiting
- REST APIs
- Responsive dark navy / electric blue UI

## Features

- Public project enquiry form
- Admin login with protected routes
- Lead directory with search and filters
- Status / priority / source / project / budget management
- Lead scoring and temperature
- Sales pipeline
- Analytics and source distribution
- Follow-up tracking
- Lead activity timeline
- CSV export
- Delete and edit lead records
- MongoDB persistence
- Development CORS supports localhost ports

## Local setup

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run seed:admin
npm run dev
```

Default local credentials:

- Email: `admin@leaddesk.local`
- Password: `Admin@123`

Change the password/secret before deployment.

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend defaults to `http://localhost:5173`. If Vite selects another local port, V3 backend CORS accepts localhost development ports.

## Repair the six existing demo leads

If you are using the supplied MongoDB database and the six existing demo records:

```bash
cd backend
npm run repair:leads
```

## Production verification

```bash
cd frontend
npm run build
npm run preview
```

The production build is generated in `frontend/dist`.

## Important

Do not commit `.env` files, JWT secrets or database credentials.
