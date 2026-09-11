# TRIPWISE — Weather-Aware Adaptive Travel Itinerary Platform

> *"Your itinerary doesn't just plan your trip. It adapts to it."*

TRIPWISE is a full-stack, weather-adaptive travel planning application built for the GDG Society NSUT recruitment task. It generates tailored daily travel itineraries based on destination, duration, traveler persona, and real-time forecast data from the Open-Meteo API.

---

## 📚 BEGINNER EXPLANATION FOR INTERVIEWS

### 1. WHAT CHANGED

| File | What changed | Why it was needed |
| ---- | ------------ | ----------------- |
| [backend/src/server.ts](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/backend/src/server.ts) | Added `/api/ai/ask` and `/api/admin/stats` endpoints | Provides secure backend AI assistant processing and admin dashboard analytics. |
| [backend/supabase_schema.sql](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/backend/supabase_schema.sql) | Added `role` column to `profiles` table | Enables simple role-based access control (`'user'` vs `'admin'`). |
| [frontend/src/lib/routeOptimizer.ts](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/lib/routeOptimizer.ts) | Created Haversine distance and Nearest-Neighbor algorithm | Reorders daily activities to minimize transit distance between stops. |
| [frontend/src/components/TripWiseAIModal.tsx](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/components/TripWiseAIModal.tsx) | Created contextual Q&A chat assistant | Allows users to ask questions about their trip in real time. |
| [frontend/src/components/WeatherAdvisorCard.tsx](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/components/WeatherAdvisorCard.tsx) | Created weather advisory card | Converts Open-Meteo forecast data into actionable travel advice. |
| [frontend/src/components/SmartRouteCard.tsx](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/components/SmartRouteCard.tsx) | Created route optimization card | Displays distance metrics, km saved, and transit time estimates. |
| [frontend/src/components/TripReminderBanner.tsx](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/components/TripReminderBanner.tsx) | Created simple in-app reminder banner | Reminds users about upcoming travel dates and forecasts. |
| [frontend/src/app/admin/page.tsx](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/app/admin/page.tsx) | Created protected Admin Dashboard | Displays real user counts, trips created, AI usage, and popular destinations. |
| [frontend/src/app/trip/[id]/page.tsx](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/app/trip/[id]/page.tsx) | Integrated AI modal, Weather Advisor, and Smart Route cards | Connects all new features into the core trip detail view. |
| [frontend/src/components/Navbar.tsx](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/components/Navbar.tsx) | Added Admin navigation link | Allows signed-in users to navigate to the Admin Dashboard. |

---

### 2. SIMPLE ARCHITECTURE

```
                                  USER
                                   ↓
                             NEXT.JS FRONTEND
                             (React / Tailwind)
                                   ↓
                           EXPRESS BACKEND API
                          (/api/trips, /api/ai)
                       ↙           ↓           ↘
          OPEN-METEO API     SUPABASE DB       GEMINI AI API
        (Weather Forecast)  (PostgreSQL Auth)   (Backend Only)
```

---

### 3. FEATURE EXPLANATIONS

#### Feature 1: TripWise AI
* **WHAT is it?** A contextual chat assistant that answers questions about your trip.
* **WHY did we add it?** To give travelers personalized advice about their itinerary.
* **HOW does it work?** The frontend sends trip context + user question to `/api/ai/ask` on the backend, which securely queries the AI API.
* **LIMITATIONS:** Requires an active backend connection and Gemini API key (with fallback rule-based answers if unconfigured).

#### Feature 2: Weather Advisor
* **WHAT is it?** A smart recommendation card based on Open-Meteo weather forecast data.
* **WHY did we add it?** To warn users about rain or high heat and suggest indoor alternatives.
* **HOW does it work?** Reads precipitation risk and temperature from Open-Meteo, rendering simple advice.
* **LIMITATIONS:** Dependent on forecast accuracy provided by Open-Meteo.

#### Feature 3: Smart Route Optimization
* **WHAT is it?** A route reordering system for daily itinerary stops.
* **WHY did we add it?** To reduce unnecessary back-and-forth transit between activities.
* **HOW does it work?** Uses the Haversine formula to compute distances between latitude/longitude points and orders them using Nearest Neighbor.
* **LIMITATIONS:** Estimates straight-line distance, not live road traffic.

#### Feature 4: Admin Dashboard (`/admin`)
* **WHAT is it?** A protected dashboard showing real application metrics.
* **WHY did we add it?** To monitor platform statistics (users, trips, AI queries).
* **HOW does it work?** Checks user profile role (`admin`) in Supabase and queries aggregated backend stats.
* **LIMITATIONS:** Access is restricted to authorized profiles.

#### Feature 5: Simple Trip Reminders
* **WHAT is it?** An in-app notification banner for upcoming travel dates.
* **WHY did we add it?** To help travelers prepare before departure.
* **HOW does it work?** Displays a card at the top of Dashboard and Trip views.
* **LIMITATIONS:** In-app notification card (does not require background push permissions).

---

### 4. CODE I MUST UNDERSTAND

1. **[server.ts](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/backend/src/server.ts) (`app.post('/api/ai/ask')`)**: Receives trip context and user query, securely queries Gemini API on backend.
2. **[server.ts](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/backend/src/server.ts) (`app.get('/api/admin/stats')`)**: Aggregates total users, trips, popular destinations, and AI query counts.
3. **[routeOptimizer.ts](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/lib/routeOptimizer.ts) (`calculateHaversineDistance`)**: Computes distance in kilometers between two lat/lng coordinates.
4. **[routeOptimizer.ts](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/lib/routeOptimizer.ts) (`optimizeDayRoute`)**: Applies Nearest Neighbor algorithm to reorder activities.
5. **[WeatherAdvisorCard.tsx](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/components/WeatherAdvisorCard.tsx)**: Evaluates rain percentage and temperature to display travel advice.
6. **[TripWiseAIModal.tsx](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/components/TripWiseAIModal.tsx)**: Manages chat state and communicates with backend `/api/ai/ask`.
7. **[SmartRouteCard.tsx](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/components/SmartRouteCard.tsx)**: Renders route optimization trigger button and distance savings summary.
8. **[admin/page.tsx](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/app/admin/page.tsx)**: Verifies admin role and renders database metrics.
9. **[supabase_schema.sql](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/backend/supabase_schema.sql)**: Defines database tables (`trips`, `profiles`) and Row Level Security (RLS) policies.
10. **[Navbar.tsx](file:///Users/apple/Desktop/GDG%20DEV%20TASK/TRIPWISE/frontend/src/components/Navbar.tsx)**: Main navigation component with smooth anchor scroll and role link.

---

### 5. INTERVIEW QUESTIONS & ANSWERS

1. **Explain your project:**
   * *"TRIPWISE is a weather-adaptive travel itinerary application. It generates personalized travel itineraries based on destination, duration, traveler persona, and real-time weather forecasts."*
2. **Why did you choose a travel itinerary application?**
   * *"Travel plans often get ruined by sudden bad weather. I wanted to build an app that dynamically adjusts activities based on weather forecasts."*
3. **How does the itinerary generator work?**
   * *"It takes user inputs, fetches weather forecast data from Open-Meteo, filters activities matching the persona, and scores them based on weather suitability."*
4. **How does the weather API work?**
   * *"We use Open-Meteo, a free REST API. We pass latitude and longitude, and receive daily temperature and rain probabilities."*
5. **What is an API?**
   * *"API stands for Application Programming Interface. It allows two software applications to communicate and share data."*
6. **How does TripWise AI work?**
   * *"The user asks a question, the frontend sends it with trip context to our backend, which forwards it to Gemini API and returns the response."*
7. **Why is the AI API called through the backend?**
   * *"To keep the API key secure. If called directly from the browser, any user could view the secret key."*
8. **Where is the API key stored?**
   * *"In environment variables (`.env`) on the backend server, which is listed in `.gitignore`."*
9. **Is AI responsible for generating weather data?**
   * *"No. Open-Meteo is the source of truth for weather data. AI is only used to answer contextual questions."*
10. **How does Smart Route Optimization work?**
    * *"It takes the activities planned for a day and calculates distances between their coordinates using the Haversine formula, then reorders them."*
11. **What algorithm did you use for route optimization?**
    * *"The Nearest-Neighbor algorithm. It starts at the first location and repeatedly visits the closest unvisited location."*
12. **Why did you choose that algorithm?**
    * *"Because it is simple, fast, and easy to explain during interviews while delivering effective distance reductions."*
13. **How do latitude and longitude help?**
    * *"Latitude and longitude provide exact geographic coordinates on Earth, allowing accurate distance calculation."*
14. **Does your route optimization account for traffic?**
    * *"No. It calculates approximate straight-line geographical distance to keep the application fast and reliable."*
15. **What are the limitations of your route optimization?**
    * *"It approximates transit times using average city speeds rather than live GPS traffic data."*
16. **Why did you create an admin dashboard?**
    * *"To monitor real-time platform statistics like registered users, total trips created, and popular destinations."*
17. **How do you prevent normal users from accessing it?**
    * *"Using role-based access control. The database stores a `role` field (`admin` vs `user`), and `/admin` checks user authorization."*
18. **How does your application use Supabase?**
    * *"Supabase handles PostgreSQL database storage for trips/profiles and user authentication."*
19. **What is authentication?**
    * *"Authentication verifies who a user is (e.g., logging in with email and password)."*
20. **What is authorization?**
    * *"Authorization determines what permissions a verified user has (e.g., normal user vs admin access)."*
21. **What happens when an API fails?**
    * *"The application handles errors gracefully using fallback mechanisms so the user experience is never broken."*
22. **What was the hardest part of the project?**
    * *"Ensuring smooth integration between weather data scoring, itinerary generation, and frontend state management."*
23. **What did you learn?**
    * *"Full-stack development, API integration, backend security practices, and practical algorithm implementation."*
24. **What would you improve in the future?**
    * *"Adding interactive maps, live road travel times via Google Maps API, and offline caching."*
25. **Why did you use AI-assisted development?**
    * *"To accelerate modern UI design prototyping, maintain clean architecture patterns, and debug efficiently."*

---

### 6. FIVE-MINUTE PROJECT EXPLANATION SCRIPT

* **Minute 1: Problem & Solution**
  * *"Hello! I built TRIPWISE, a weather-aware adaptive travel itinerary app. Traditional travel itineraries are static, but bad weather can ruin outdoor plans. TRIPWISE solves this by combining weather forecast data with traveler personas."*
* **Minute 2: Core Functionality & Weather Integration**
  * *"When a user enters a destination and persona, TRIPWISE fetches real-time forecast data from the Open-Meteo API. It scores activities based on temperature and rain probability, creating a balanced day-by-day plan."*
* **Minute 3: TripWise AI & Weather Advisor**
  * *"We added TripWise AI—a contextual assistant. Users can ask questions like 'What if it rains on Day 2?'. The request goes to our Express backend, which securely queries the AI model. The Weather Advisor also displays automatic alerts."*
* **Minute 4: Smart Route & Admin Dashboard**
  * *"To reduce transit hassle, Smart Route uses the Haversine formula and Nearest-Neighbor algorithm to reorder activities. We also built a protected `/admin` dashboard displaying real user and trip stats from Supabase."*
* **Minute 5: Architecture & Key Takeaway**
  * *"Our stack uses Next.js for frontend, Express for backend, Supabase for PostgreSQL, and Open-Meteo for weather. Everything is modular and secure. Thank you!"*

---

### 7. DEPLOYMENT PREPARATION CHECKLIST

#### Vercel Environment Variables (Frontend)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_BACKEND_URL=https://your-render-backend.onrender.com
```

#### Render Environment Variables (Backend)
```env
PORT=5000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

#### Commands
* **Vercel Build Command:** `npm run build`
* **Render Build Command:** `npm install && npm run build`
* **Render Start Command:** `npm run start`

---

## 🛠️ LOCAL SETUP INSTRUCTIONS

```bash
# 1. Start Frontend
cd "TRIPWISE/frontend"
npm install
npm run dev

# 2. Start Backend (in second terminal)
cd "TRIPWISE/backend"
npm install
npm run dev
```

Visit **http://localhost:3000** to view the application!
