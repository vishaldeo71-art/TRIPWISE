# TRIPWISE — Weather-Aware Adaptive Travel Planning Platform

> *"Your itinerary doesn't just plan your trip. It adapts to it."*

TRIPWISE is a full-stack, weather-adaptive travel planning application built for the GDG Society NSUT recruitment task. It generates tailored daily travel itineraries with **real destination-specific places**, **Geoapify places API**, **Gemini AI personalized ranking & receipt document extraction**, **Supabase database & storage**, **nearest Metro/Public Transport stations**, and **instant rain Plan B fallbacks**.

---

## 🚀 NEW IMPRESSIVE PRODUCT FEATURES (P0 + P1)

1. **TripWise Inspiration Library (`/inspiration`)**
   - Browse curated destination itineraries (Delhi, London, Paris, Tokyo, Dubai).
   - **`Use This Trip`**: 1-click clone itinerary to user's saved trips.
   - **`Make It My Own`**: Uses Gemini AI to re-pace and customize activities based on traveler persona (Backpacker, Family, Luxury, Explorer).

2. **Geoapify + Gemini Tailored Recommendations (`/plan`, `/trip/[id]`)**
   - Real place recommendations powered by **Geoapify Places API** (tourism sights, restaurants, parks, leisure).
   - **Gemini AI** ranks recommendations and explains *why* the spot is recommended for the selected persona.
   - **`[ + Add to Trip ]`**: 1-click add any recommended place directly into the user's active day itinerary.

3. **Travel Vault & AI Receipt Extraction (`/vault`)**
   - Authenticated document vault storing hotel bookings, food bills, and ticket receipts in **Supabase Storage**.
   - **Multimodal Gemini AI Extraction**: Automatically parses uploaded receipt images/PDFs into structured JSON: Title, Category Type, Date, Location, Total Amount, Currency, and Booking Reference #.
   - Filterable UI (All, Hotels, Food, Tickets, Transport, Other) with delete button and secure user isolation (RLS).

4. **Lightweight Collaboration & Activity Likes (`/trip/[id]`)**
   - Share public trip links with friends (`/trip/[shareId]`).
   - Like activities and leave traveler comments/tips on shared itineraries.

---

## 🛠️ ARCHITECTURE & TECH STACK

- **Frontend**: Next.js 14 / TypeScript / Vanilla CSS Design Tokens (Vercel)
- **Backend**: Express.js / Node.js TypeScript REST API (Render)
- **Database, Auth & Storage**: Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
- **AI Engine**: Google Gemini API (`gemini-1.5-flash` Multimodal)
- **Geospatial & Places**: Geoapify Places API v2 + Open-Meteo Weather API

```
                        USER
                         ↓
                  VERCEL FRONTEND
             (Next.js App Router UI)
                         ↓
                  RENDER BACKEND
               (Express API Server)
            ↙         ↓          ↘
       SUPABASE    GEMINI API   GEOAPIFY
       DB/Storage   (AI Logic)   (Places)
```

---

## 🔑 ENVIRONMENT VARIABLES SETUP

### Backend (`backend/.env`)
```env
PORT=5001
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key_here
GEOAPIFY_API_KEY=your_geoapify_api_key_here
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5001
```

---

## 📚 STEP-BY-STEP API KEY GENERATION GUIDE FOR BEGINNERS

### 1. How to Get a Free Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click the **"Get API Key"** button on the top left.
4. Click **"Create API Key in new project"**.
5. Copy the generated string starting with `AIzaSy...`.
6. Open `backend/.env` and paste it into `GEMINI_API_KEY=AIzaSy...`.
7. **Important**: Keep `GEMINI_API_KEY` on the backend server only. Never put it in frontend code.

### 2. How to Get a Free Geoapify API Key
1. Go to [Geoapify MyProjects](https://myprojects.geoapify.com/).
2. Register for a free account.
3. Click **"Create New Project"** and name it `TRIPWISE`.
4. Copy the API Key under Project Details.
5. Open `backend/.env` and paste it into `GEOAPIFY_API_KEY=...`.

---

## 💡 INTERVIEW PREPARATION (18 ANSWERS)

1. **Why did you use Gemini?**
   > *"We used Gemini for natural language reasoning, personalized recommendation explanations, adapting inspiration trips to traveler personas, and multimodal structured receipt extraction."*

2. **Why did you use Geoapify?**
   > *"Geoapify provides real-world location data (sights, restaurants, parks, coordinates) for specific cities so AI never invents fake places."*

3. **Why shouldn't the Gemini API key be in the frontend?**
   > *"Frontend code runs in the user's browser, making any API key visible in DevTools. Keeping keys on the Express backend prevents key theft and quota abuse."*

4. **How does your AI recommendation system work?**
   > *"Geoapify fetches real places near the destination coordinates. Then Gemini ranks those places and generates a 1-sentence reason why that place fits the user's specific persona."*

5. **How does Geoapify find places?**
   > *"Geoapify queries OpenStreetMap geospatial data using category filters and a circle radius search around the destination city's coordinates."*

6. **How do you make recommendations destination-specific?**
   > *"Geoapify queries are filtered by exact city latitude/longitude coordinates, ensuring places from other cities never leak in."*

7. **How does the Inspiration page work?**
   > *"It displays curated high-quality itineraries for major cities. Users can clone them directly or click 'Make It My Own' to customize them with Gemini."*

8. **How does 'Make It My Own' work?**
   > *"It sends the template trip and the user's chosen persona to Gemini, which adapts activity descriptions and pacing before saving it to the user's account."*

9. **How does receipt extraction work?**
   > *"The user uploads a receipt image. The backend converts it to base64 and sends it to Gemini's multimodal API, which parses and returns structured JSON (vendor, date, total amount, booking ref)."*

10. **Where are uploaded receipts stored?**
    > *"Receipt files are stored securely in Supabase Storage (`receipts` bucket), while extracted JSON metadata is stored in Supabase PostgreSQL (`receipts` table)."*

11. **How do you protect users' receipts?**
    > *"We enforce Supabase Row Level Security (RLS) policies so authenticated users can only view and delete their own uploaded receipts."*

12. **What happens if Gemini fails?**
    > *"TRIPWISE has built-in rule fallbacks. If Gemini is down, the itinerary engine, recommendations, and vault uploads still function smoothly."*

13. **What happens if Geoapify fails?**
    > *"The app falls back to curated destination landmark datasets so users never see a broken page."*

14. **Why didn't you implement flight booking?**
    > *"Flight booking requires live GDS APIs, commercial affiliate keys, and payment gateway compliance, which is unrealistic for a 2-3 hour timeframe."*

15. **Why didn't you implement real-time collaboration?**
    > *"Real-time WebSocket CRDT editing adds significant complexity. Lightweight sharing with public links, activity likes, and comments delivers high user value reliably."*

16. **What is the difference between AI-generated information and API-provided information?**
    > *"API information provides factual ground truth (real place names, coordinates, weather data), while AI provides reasoning, natural language summaries, and personalization."*

17. **What was the hardest part?**
    > *"Integrating multimodal AI receipt parsing with Supabase Storage while maintaining fallback reliability across local and cloud environments."*

18. **What would you improve with more time?**
    > *"I would add real-time transit GTFS feeds and expense tracking budgeting charts in the Travel Vault."*
