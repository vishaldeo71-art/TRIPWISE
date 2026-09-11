# TRIPWISE — Weather-Aware Adaptive Travel Itinerary Platform

> *"Your itinerary doesn't just plan your trip. It adapts to it."*

TRIPWISE is a full-stack, weather-adaptive travel planning application built for the GDG Society NSUT recruitment task. It generates tailored daily travel itineraries with **real destination-specific places**, **nearest Metro/Public Transport stations**, **Nearest-Neighbor route optimization**, **weather adaptations**, and **zero cross-city contamination**.

---

## 📚 BEGINNER EXPLANATION FOR INTERVIEWS

### 1. TECHNICAL ARCHITECTURE & FLOW

```
                                  USER
                                   ↓
                            NEXT.JS FRONTEND
                        (Destination + Persona)
                                   ↓
                        DESTINATION-SPECIFIC DATA
                   (Delhi Places vs London Places)
                                   ↓
                   OPEN-METEO WEATHER FORECAST API
               (Rain Check → Outdoor vs Indoor Fallback)
                                   ↓
                       SMART ROUTE OPTIMIZATION
                  (Haversine + Nearest-Neighbor Order)
                                   ↓
                    METRO & PUBLIC TRANSPORT ENGINE
                  (Proximity Matching → Station Links)
                                   ↓
                      DAILY ADAPTIVE ITINERARY
                                   ↓
                           TRIPWISE AI API
                    (Contextual Chat Assistant)
```

---

### 2. DETAILED FEATURE BREAKDOWN (A TO J)

#### A. How Destination-Specific Itinerary Generation Works
* When the user enters a city name (e.g. "Delhi", "London", "Paris", "Tokyo"), the system normalizes the city string and fetches curated, real place data from `destinationPlaces.ts`.
* Each place contains real names (e.g., Red Fort, Humayun's Tomb, Big Ben, Tower Bridge), real descriptions, exact `lat`/`lng` coordinates, outdoor/indoor flags, and real indoor alternatives.

#### B. How Cross-City Contamination is Prevented (Zero-Leak Rule)
* Places are grouped inside `DESTINATION_REGISTRY[cityKey]`.
* Destination selection strictly limits place selection to that specific city key.
* A validation guard `validateZeroCrossContamination(city, activities)` runs before returning the itinerary. If any landmark from another city is detected, it is immediately stripped out.

#### C. How Traveler Persona Affects Recommendations
* Personas (Backpacker, Family, Luxury, Explorer, Solo Explorer) filter and score places.
* For example:
  * **Backpacker**: Prefers street food, handicraft bazaars, and walking heritage tours.
  * **Luxury**: Prefers fine dining, iconic monuments, and comfortable pacing.
  * **Family**: Prefers kid-friendly parks, museums, and manageable walking distances.

#### D. How Weather Affects Activity Selection
* Live daily forecast data is fetched from the Open-Meteo API (precipitation probability, temperature, WMO weather codes).
* If rain probability on a day exceeds 40-45%, outdoor attractions are automatically swapped with climate-controlled indoor alternatives (e.g., Red Fort → National Museum).

#### E. How Route Optimization Works
* Activities are ordered using a **Nearest-Neighbor algorithm**.
* The itinerary starts at the morning attraction, finds the unvisited attraction with the shortest distance, and sets it as the next stop to eliminate unnecessary travel back-and-forth.

#### F. How Latitude and Longitude Are Used
* Every attraction and metro station has exact `lat` and `lng` coordinates.
* The system calculates the geographical straight-line distance between locations using the **Haversine formula**.

#### G. How the Nearest Metro Station is Found
* For each attraction `(lat, lng)`, the system calculates the distance to all metro stations in that city's dataset using the Haversine formula.
* The station with the smallest distance is assigned as `nearestMetro`.

#### H. How the Metro & Public Transport Section Works
* Displays `🚇 Near [Station Name] Metro` badges with estimated walking time.
* Displays inter-activity transit connectors (e.g., `Lal Qila → Jama Masjid • ~10 min metro, ~5 min walk`).
* Provides an `Open Route` button linking to Google Maps Transit view (`https://www.google.com/maps/dir/?api=1&origin=...&destination=...&travelmode=transit`).

#### I. Calculated vs External APIs
* **External APIs**: Open-Meteo Geocoding API (city coordinates) and Open-Meteo Weather Forecast API (weather risk).
* **Calculated Locally**: Haversine distance, Nearest-Neighbor sorting, nearest metro station matching, travel time estimates, and Trip Health score.

#### J. System Limitations
* Transit travel times are calculated approximations based on distance and average urban transit speeds, not real-time train schedules.
* For cities without curated place data, a safe fallback generator builds realistic city-anchored places using geocoded coordinates without showing wrong cities.

---

## 💡 INTERVIEW QUESTIONS & ANSWERS (1 TO 17)

1. **"How does your itinerary generator work?"**
   > *"When a user selects a destination, persona, and duration, TripWise fetches real curated places for that city, filters them by traveler persona, checks Open-Meteo forecast data to adjust for rain, orders them geographically using Nearest Neighbor, and links nearest metro stations."*

2. **"How do you make recommendations specific to the destination?"**
   > *"We maintain a destination-aware database (`destinationPlaces.ts`) mapped by city keys. Each city has curated real landmarks, coordinates, descriptions, and local metro station datasets."*

3. **"How do you make sure Delhi places don't appear when someone selects London?"**
   > *"Destination selection strictly gates place selection to that city's registry key. We also run a `validateZeroCrossContamination` guard function that verifies every place belongs to the selected city before rendering."*

4. **"How does your route optimization work?"**
   > *"We calculate the geographical distance between activities using the Haversine formula and reorder them using a Nearest-Neighbor algorithm so activities close to each other are grouped together."*

5. **"Which algorithm did you use?"**
   > *"We used the **Nearest-Neighbor algorithm** paired with the **Haversine distance formula**."*

6. **"Why did you choose that algorithm?"**
   > *"It is computationally efficient, simple to implement on the frontend, and easy to explain clearly in an interview without unnecessary complexity."*

7. **"How do latitude and longitude help?"**
   > *"Latitude and longitude provide exact spatial coordinates for attractions and metro stations, allowing us to calculate distances and order activities geographically."*

8. **"How did you integrate metro routes?"**
   > *"We match attraction coordinates to the nearest metro station in that city using Haversine proximity, calculate estimated transit/walk times, and provide Google Maps Transit links."*

9. **"Are your metro travel times live?"**
   > *"No, they are approximate planning estimates calculated using geographical distance and average urban transit speeds. We clearly label them as 'Estimated' in the UI."*

10. **"What happens if a city doesn't have a metro?"**
    > *"For cities without a metro, the system displays general public transport guidance and provides direct Google Maps transit route links."*

11. **"How does weather affect the itinerary?"**
    > *"We fetch precipitation risk from Open-Meteo. If rain risk exceeds 40%, outdoor activities automatically swap to indoor alternatives (Plan B Mode)."*

12. **"How does the traveler persona affect the itinerary?"**
    > *"Personas (e.g. Backpacker vs Luxury) filter place suitability. Backpackers get budget street food and walking tours, while Luxury travelers get premium dining and iconic spots."*

13. **"What is the role of AI?"**
    > *"TripWise AI serves as a contextual assistant. It takes the generated itinerary, places, weather, and transit data as context and answers user questions about why places were chosen or what to prepare."*

14. **"Why didn't you let AI generate the entire itinerary?"**
    > *"AI can hallucinate non-existent places or invent fake travel times. Using a deterministic place-selection and routing engine guarantees zero cross-city contamination, reliable metro stations, and consistent performance."*

15. **"What are the limitations of your route optimization?"**
    > *"It uses straight-line Haversine distance rather than live road traffic or subway schedules."*

16. **"What was the hardest part of implementing this?"**
    > *"Ensuring strict zero cross-city contamination while dynamically mapping real metro stations and weather fallbacks seamlessly across multi-day itineraries."*

17. **"What would you improve in the future?"**
    > *"I would integrate real-time public transit APIs (like GTFS feeds) and live traffic routing."*

---

## 🛠️ LOCAL RUN & TESTING INSTRUCTIONS

### 1. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Run Local Development Servers
```bash
# Terminal 1 - Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend Next.js (Port 3000)
cd frontend
npm run dev
```

### 3. Open Application
Open [http://localhost:3000](http://localhost:3000) in your browser.
