# Dhaham School Event Management System
**Full-Stack MERN Application — Sri Lanka**

---

## Project Structure

```
dhaham-ems/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── cloudinary.js          # Cloudinary + Multer upload config
│   ├── controllers/
│   │   ├── authController.js      # Login, register, JWT
│   │   ├── applicationController.js # Submit, approve, reject
│   │   ├── eventController.js     # CRUD events, calendar
│   │   ├── resultController.js    # Results, PDF/Excel download
│   │   ├── schoolController.js    # School management
│   │   └── dashboardController.js # Stats, announcements, artwork
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + authorize
│   │   └── errorHandler.js        # Global error handler
│   ├── models/
│   │   ├── User.js                # Admin, school, student accounts
│   │   ├── School.js              # Dhaham school records
│   │   ├── Application.js         # Student event applications
│   │   ├── Event.js               # Events (school/zonal/provincial)
│   │   ├── Result.js              # Event results with winners
│   │   └── Announcement.js        # Dashboard announcements
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── resultRoutes.js
│   │   ├── schoolRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── studentRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   ├── emailService.js        # Nodemailer templates
│   │   ├── reportGenerator.js     # PDF (pdfkit) + Excel (exceljs)
│   │   └── seed.js                # Database seeder
│   ├── server.js                  # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.js     # JWT auth state
        ├── services/
        │   └── api.js             # Axios API calls
        ├── styles/
        │   └── global.css         # Design system
        ├── components/
        │   └── common/
        │       ├── Navbar.js
        │       └── Footer.js
        ├── pages/
        │   ├── HomePage.js        # Artwork slider + announcements + events
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── EventsPage.js      # Filterable event listing
        │   ├── EventDetailPage.js
        │   ├── ApplyPage.js       # Full application form + file upload
        │   ├── ApplicationsPage.js
        │   ├── DashboardPage.js   # Role-aware dashboard
        │   ├── ResultsPage.js     # Winners + PDF/Excel download
        │   └── admin/
        │       ├── AdminDashboard.js
        │       ├── AdminApplications.js # Review + approve/reject
        │       ├── AdminEvents.js
        │       ├── AdminResults.js
        │       ├── AdminSchools.js
        │       └── AdminUsers.js
        ├── App.js                 # Routes + auth guards
        └── index.js
```

---

## Quick Setup

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in .env with your MongoDB URI, Cloudinary, email credentials

# Frontend
cd ../frontend
npm install
```

### 2. Configure .env (backend)

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates:
- **Admin:** `admin@dhaham.lk` / `Admin@123`
- **School:** `colombo@dhaham.lk` / `Dhaham@DSC001`
- 3 sample schools and 3 sample events

### 4. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # Runs on port 5000

# Terminal 2 — Frontend
cd frontend
npm start          # Runs on port 3000
```

---

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/login | Public | Login |
| POST | /api/auth/register | Public | Student register |
| GET | /api/auth/me | Private | Current user |
| GET | /api/events | Public | List events |
| POST | /api/events | Admin | Create event |
| GET | /api/events/calendar | Public | Calendar data |
| POST | /api/applications | Student | Submit application |
| GET | /api/applications | Private | List applications |
| PUT | /api/applications/:id/review | Admin | Approve/reject |
| GET | /api/results | Private | Published results |
| POST | /api/results | Admin | Create results |
| PUT | /api/results/:id/publish | Admin | Publish + notify schools |
| GET | /api/results/:id/download/pdf | Private | PDF download |
| GET | /api/results/:id/download/excel | Private | Excel download |
| POST | /api/schools | Admin | Create school |
| GET | /api/dashboard/admin | Admin | Admin stats |
| GET | /api/dashboard/artwork | Public | Artwork slider |

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **admin** | Full system access, approve/reject applications, manage events/results/schools/users |
| **school** | View own school's applications, download results |
| **student** | Register, apply for events, view own application status |

---

## Key Features Implemented

- ✅ Student registration with school selection
- ✅ Event application form with passport photo + birth certificate upload
- ✅ Auto-generated registration numbers (DHS-2025-00001)
- ✅ JWT auth with refresh tokens (admin, school, student roles)
- ✅ Admin approval/rejection with automated email notifications
- ✅ Event calendar with grade and type filtering
- ✅ Results management with top 3 winner showcase
- ✅ PDF and Excel result sheet generation
- ✅ Email notifications to all schools on result publish
- ✅ Artwork image slider on homepage
- ✅ Announcement system
- ✅ Multi-school district-scale architecture
- ✅ MVC folder structure
- ✅ Input validation and global error handling
- ✅ Rate limiting and security headers (Helmet)
- ✅ Responsive UI with Sri Lanka school theme

---

## Deployment

**Backend:** Railway / Render / Heroku  
**Frontend:** Vercel / Netlify  
**Database:** MongoDB Atlas  
**Files:** Cloudinary  

Set `FRONTEND_URL` in backend `.env` to your deployed frontend URL.
