# TRIPWISE 🧭🌧️
> *"Your itinerary doesn't just plan your trip. It adapts to it."*

TRIPWISE is a modern, responsive, weather-aware travel itinerary application built for the GDG NSUT recruitment task. Unlike generic static travel planners, TRIPWISE dynamically adjusts daily schedules, outdoor activities, and pacing based on live weather forecasts (rain, sunshine, temperature) and traveler personas (Backpacker, Family, Luxury, Explorer, Solo Explorer).

---

## 🌟 Key Features

- 🌤️ **Weather-Aware Planning**: Fetches real-time public weather forecasts (via Open-Meteo) and evaluates outdoor suitability for your destination.
- 🎒 **Persona-Aware Engine**: Customizes activity recommendations, budget levels, and travel intensity to match your traveler persona (Backpacker, Family, Luxury, Explorer).
- 🌧️ **🔥 "What if it rains?" Instant Plan B**: One-click toggle that automatically replaces weather-sensitive outdoor activities with top-rated indoor alternatives, explaining *why* changes occurred.
- 🛡️ **Trip Health Score (0–100)**: Deterministic planning metric calculating weather compatibility, activity spacing, and persona alignment.
- ❓ **"Why this Activity?" Rationale**: Clear logic explaining why each activity was chosen based on your travel preferences.
- 🚶 **Travel Pacing & Distance Estimates**: Displays travel duration estimates between locations (`🚶 15 min walk`, `🚗 15 min drive`).
- 🔐 **Supabase Authentication**: Secure email/password login, registration, and user isolation.
- 🔗 **Shareable Itineraries**: Generate clean, shareable trip URLs (`/trip/[shareId]`) that keep private user account details secure.
- 💾 **LocalStorage Drafts**: Seamless offline draft creation so you can plan trips instantly even before logging in.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Express.js (Node.js REST API with TypeScript)
- **Database & Auth**: Supabase PostgreSQL & Supabase Auth
- **Weather & Geocoding**: Open-Meteo Weather API & Open-Meteo Geocoding API (*100% free, no API key required*)
- **Deployments**: Vercel (Frontend), Render (Backend), Supabase Cloud (Database)

---

## 🏗️ Architecture

```
[ USER ]
   │
   ├──► [ Next.js Frontend (Vercel) ]
   │         │
   │         ├──► [ Supabase Auth & PostgreSQL DB ]
   │         │
   │         └──► [ Open-Meteo Forecast & Geocoding APIs ]
   │
   └──► [ Express REST API (Render) ]
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/tripwise.git
cd tripwise

# Install Frontend Dependencies
cd frontend
npm install

# Install Backend Dependencies
cd ../backend
npm install
```

### 2. Configure Environment Variables
Create `.env.local` inside `frontend/`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

Create `.env` inside `backend/`:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NODE_ENV=development
```

### 3. Run Applications
In terminal 1 (Frontend):
```bash
cd frontend
npm run dev
# Running on http://localhost:3000
```

In terminal 2 (Backend):
```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/trips` | Save a new trip |
| `GET` | `/api/trips/:id` | Retrieve trip by ID or shareId |
| `GET` | `/api/share/:shareId` | Get public shareable trip |
| `DELETE` | `/api/trips/:id` | Delete a saved trip |

---

## 🔒 Security Practices

- Supabase Service-Role keys and backend secrets remain in backend environment variables on Render.
- Frontend exposes only public configuration (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Row Level Security (RLS) policies enforce user isolation on private trips.

---

## 📸 Screenshots

*(Add application screenshots here showing Landing Page, Dashboard, Create Form, and Plan B Rain Mode)*

---

## 🚀 Deployment Instructions

- **Frontend**: Deployed on [Vercel](https://vercel.com)
- **Backend**: Deployed on [Render](https://render.com)
- **Database**: Hosted on [Supabase](https://supabase.com)
