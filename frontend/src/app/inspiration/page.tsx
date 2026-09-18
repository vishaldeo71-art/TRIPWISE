'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Trip, Persona } from '@/types/trip';
import { SparklesIcon, MapPinIcon, UserIcon, ArrowRightIcon, CheckIcon, CompassIcon, CloseIcon } from '@/components/Icons';
import { supabase } from '@/lib/supabase';

interface InspirationTrip {
  id: string;
  destination: string;
  durationDays: number;
  persona: Persona;
  title: string;
  tag: string;
  description: string;
  highlights: string[];
  imageUrl: string;
  pace: 'Relaxed' | 'Balanced' | 'Packed';
  interests: string[];
  days: any[];
}

const INSPIRATION_TRIPS: InspirationTrip[] = [
  {
    id: 'insp-delhi-history',
    destination: 'Delhi',
    durationDays: 3,
    persona: 'Explorer',
    title: 'Delhi — History & Culture',
    tag: 'Popular • Heritage',
    description: 'Immerse in centuries of imperial architecture, majestic Mughal forts, and ancient minarets across Old & New Delhi.',
    highlights: ['Red Fort', "Humayun's Tomb", 'Qutub Minar', 'Chandni Chowk Walk'],
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    pace: 'Balanced',
    interests: ['History', 'Culture'],
    days: [
      {
        dayNumber: 1,
        title: 'Old Delhi Imperial Heritage',
        weatherForecast: { tempC: 28, condition: 'Sunny', rainProbability: 10, suitability: 'High', icon: '☀️' },
        activities: [
          { name: 'Red Fort (Lal Qila)', durationMinutes: 120, bestTime: 'Morning', description: 'Explore the 17th-century Mughal red sandstone fortress.', isOutdoor: true, category: 'culture', nearestMetro: { stationName: 'Lal Qila', distanceKm: 0.3, walkTimeMin: 4 } },
          { name: 'Jama Masjid & Bazaar Walk', durationMinutes: 90, bestTime: 'Afternoon', description: 'Marvel at one of India’s largest mosques and historic bazaars.', isOutdoor: true, category: 'culture', nearestMetro: { stationName: 'Jama Masjid', distanceKm: 0.2, walkTimeMin: 3 } },
          { name: 'Chandni Chowk Spice Market Food Tour', durationMinutes: 90, bestTime: 'Evening', description: 'Sample iconic street foods and paranthas at centuries-old stalls.', isOutdoor: true, category: 'food', nearestMetro: { stationName: 'Chandni Chowk', distanceKm: 0.4, walkTimeMin: 5 } }
        ]
      },
      {
        dayNumber: 2,
        title: 'Mughal Gardens & UNESCO Wonders',
        weatherForecast: { tempC: 27, condition: 'Partly Cloudy', rainProbability: 15, suitability: 'High', icon: '⛅' },
        activities: [
          { name: "Humayun's Tomb", durationMinutes: 100, bestTime: 'Morning', description: 'Precursor to the Taj Mahal, set inside Persian charbagh gardens.', isOutdoor: true, category: 'culture', nearestMetro: { stationName: 'JL Nehru Stadium', distanceKm: 1.2, walkTimeMin: 14 } },
          { name: 'National Gallery of Modern Art', durationMinutes: 90, bestTime: 'Afternoon', description: 'Explore modern Indian fine art inside historic Jaipur House.', isOutdoor: false, category: 'culture', nearestMetro: { stationName: 'Khan Market', distanceKm: 0.8, walkTimeMin: 10 } },
          { name: 'India Gate & Rajpath Sunset Walk', durationMinutes: 60, bestTime: 'Evening', description: 'Memorial arch and ceremonial boulevard lit up at dusk.', isOutdoor: true, category: 'culture', nearestMetro: { stationName: 'Central Secretariat', distanceKm: 0.9, walkTimeMin: 11 } }
        ]
      },
      {
        dayNumber: 3,
        title: 'Ancient Minarets & Spiritual Splendor',
        weatherForecast: { tempC: 29, condition: 'Clear', rainProbability: 5, suitability: 'High', icon: '☀️' },
        activities: [
          { name: 'Qutub Minar Complex', durationMinutes: 110, bestTime: 'Morning', description: '12th-century brick minaret and iron pillar surrounded by ancient ruins.', isOutdoor: true, category: 'culture', nearestMetro: { stationName: 'Qutab Minar', distanceKm: 0.9, walkTimeMin: 11 } },
          { name: 'Mehrauli Archaeological Park', durationMinutes: 80, bestTime: 'Afternoon', description: 'Lush heritage park with over 100 historic monuments.', isOutdoor: true, category: 'nature', nearestMetro: { stationName: 'Qutab Minar', distanceKm: 1.0, walkTimeMin: 12 } },
          { name: 'Gurudwara Bangla Sahib', durationMinutes: 60, bestTime: 'Evening', description: 'Peaceful Sikh house of worship with holy pool and community kitchen.', isOutdoor: false, category: 'culture', nearestMetro: { stationName: 'Patel Chowk', distanceKm: 0.5, walkTimeMin: 6 } }
        ]
      }
    ]
  },
  {
    id: 'insp-delhi-food',
    destination: 'Delhi',
    durationDays: 2,
    persona: 'Backpacker',
    title: 'Delhi — Food & Old City',
    tag: 'Street Food • Budget',
    description: 'A culinary trail through legendary street food lanes, kebab havelis, and vibrant night markets.',
    highlights: ['Paranthe Wali Gali', "Karim's Kebabs", 'Majnu ka Tilla', 'Khan Market Cafes'],
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    pace: 'Relaxed',
    interests: ['Food', 'Culture'],
    days: [
      {
        dayNumber: 1,
        title: 'Legendary Old Delhi Culinary Trail',
        weatherForecast: { tempC: 28, condition: 'Clear', rainProbability: 10, suitability: 'High', icon: '☀️' },
        activities: [
          { name: 'Paranthe Wali Gali Breakfast', durationMinutes: 90, bestTime: 'Morning', description: 'Stuffed fried paranthas served with tangy chutneys since 1870.', isOutdoor: true, category: 'food', nearestMetro: { stationName: 'Chandni Chowk', distanceKm: 0.3, walkTimeMin: 4 } },
          { name: "Karim's Mughal Dining", durationMinutes: 75, bestTime: 'Afternoon', description: 'Historic restaurant famous for slow-cooked mutton nihari and kebabs.', isOutdoor: false, category: 'food', nearestMetro: { stationName: 'Jama Masjid', distanceKm: 0.2, walkTimeMin: 3 } },
          { name: 'Dilli Haat Food Craft Bazaar', durationMinutes: 120, bestTime: 'Evening', description: 'Open-air craft bazaar featuring regional food stalls from 28 Indian states.', isOutdoor: true, category: 'food', nearestMetro: { stationName: 'INA', distanceKm: 0.1, walkTimeMin: 1 } }
        ]
      },
      {
        dayNumber: 2,
        title: 'Tibetan Flavors & Modern Cafes',
        weatherForecast: { tempC: 27, condition: 'Sunny', rainProbability: 5, suitability: 'High', icon: '☀️' },
        activities: [
          { name: 'Majnu ka Tilla Little Tibet Walk', durationMinutes: 110, bestTime: 'Morning', description: 'Charming colony filled with momo cafes, Tibetan bakeries, and prayer flags.', isOutdoor: true, category: 'food', nearestMetro: { stationName: 'Vishwa Vidyalaya', distanceKm: 1.5, walkTimeMin: 18 } },
          { name: 'Khan Market Artisan Cafes', durationMinutes: 90, bestTime: 'Afternoon', description: 'Boutique shopping lane lined with gourmet bakeries and artisan coffee shops.', isOutdoor: false, category: 'food', nearestMetro: { stationName: 'Khan Market', distanceKm: 0.2, walkTimeMin: 3 } }
        ]
      }
    ]
  },
  {
    id: 'insp-london-heritage',
    destination: 'London',
    durationDays: 3,
    persona: 'Explorer',
    title: 'London — Heritage & Architecture',
    tag: 'Classic • Museums',
    description: 'Explore royal castles, world-class free museums, and iconic Thames river landmarks.',
    highlights: ['Tower of London', 'British Museum', 'Westminster Abbey', 'Covent Garden'],
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    pace: 'Balanced',
    interests: ['History', 'Culture'],
    days: [
      {
        dayNumber: 1,
        title: 'Royal Landmarks & Tower Bridge',
        weatherForecast: { tempC: 18, condition: 'Partly Cloudy', rainProbability: 20, suitability: 'High', icon: '⛅' },
        activities: [
          { name: 'Tower of London & Crown Jewels', durationMinutes: 120, bestTime: 'Morning', description: 'Explore medieval fortress and royal armor display.', isOutdoor: true, category: 'culture', nearestMetro: { stationName: 'Tower Hill', distanceKm: 0.2, walkTimeMin: 3 } },
          { name: 'Tower Bridge Glass Walkway', durationMinutes: 60, bestTime: 'Afternoon', description: 'Walk across high glass floor with views of River Thames.', isOutdoor: true, category: 'culture', nearestMetro: { stationName: 'Tower Hill', distanceKm: 0.4, walkTimeMin: 5 } },
          { name: 'Borough Market Food Experience', durationMinutes: 90, bestTime: 'Evening', description: 'London’s premier food market featuring British cheeses and street food.', isOutdoor: true, category: 'food', nearestMetro: { stationName: 'London Bridge', distanceKm: 0.3, walkTimeMin: 4 } }
        ]
      },
      {
        dayNumber: 2,
        title: 'World Museums & West End',
        weatherForecast: { tempC: 17, condition: 'Light Rain', rainProbability: 40, suitability: 'Moderate', icon: '🌧️' },
        activities: [
          { name: 'British Museum', durationMinutes: 150, bestTime: 'Morning', description: 'World famous exhibits including Rosetta Stone and Egyptian mummies.', isOutdoor: false, category: 'culture', nearestMetro: { stationName: 'Tottenham Court Road', distanceKm: 0.5, walkTimeMin: 6 } },
          { name: 'Covent Garden Piazza & Street Theatre', durationMinutes: 90, bestTime: 'Afternoon', description: 'Bustling covered market with street performers and boutique shops.', isOutdoor: true, category: 'shopping', nearestMetro: { stationName: 'Covent Garden', distanceKm: 0.1, walkTimeMin: 1 } }
        ]
      }
    ]
  },
  {
    id: 'insp-paris-art',
    destination: 'Paris',
    durationDays: 3,
    persona: 'Luxury',
    title: 'Paris — Art & Culture',
    tag: 'Art • Fine Dining',
    description: 'Iconic art galleries, Seine river cruises, and charming hilltop bohemian alleys in Montmartre.',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Montmartre', 'Seine River Cruise'],
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    pace: 'Balanced',
    interests: ['Culture', 'Food'],
    days: [
      {
        dayNumber: 1,
        title: 'Eiffel Icon & Seine River',
        weatherForecast: { tempC: 22, condition: 'Sunny', rainProbability: 10, suitability: 'High', icon: '☀️' },
        activities: [
          { name: 'Eiffel Tower Summit Deck', durationMinutes: 120, bestTime: 'Morning', description: 'Ascend Paris landmark for panoramic views of Champ de Mars.', isOutdoor: true, category: 'culture', nearestMetro: { stationName: 'Bir-Hakeim', distanceKm: 0.6, walkTimeMin: 7 } },
          { name: 'Louvre Museum Guided Tour', durationMinutes: 150, bestTime: 'Afternoon', description: 'See the Mona Lisa, Venus de Milo, and glass pyramid courtyard.', isOutdoor: false, category: 'culture', nearestMetro: { stationName: 'Palais Royal - Musée du Louvre', distanceKm: 0.2, walkTimeMin: 3 } }
        ]
      }
    ]
  },
  {
    id: 'insp-tokyo-future',
    destination: 'Tokyo',
    durationDays: 4,
    persona: 'Explorer',
    title: 'Tokyo — Culture & Modern City',
    tag: 'Future • Shrines',
    description: 'A blend of historic Shinto shrines, cyber electronic districts, and digital art worlds.',
    highlights: ['Senso-ji Temple', 'Shibuya Crossing', 'Akihabara', 'teamLab Planets'],
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    pace: 'Packed',
    interests: ['Adventure', 'Culture'],
    days: [
      {
        dayNumber: 1,
        title: 'Historic Asakusa & Digital Art',
        weatherForecast: { tempC: 20, condition: 'Clear', rainProbability: 5, suitability: 'High', icon: '☀️' },
        activities: [
          { name: 'Senso-ji Temple & Nakamise Street', durationMinutes: 110, bestTime: 'Morning', description: 'Tokyo’s oldest temple with traditional stall shopping.', isOutdoor: true, category: 'culture', nearestMetro: { stationName: 'Asakusa', distanceKm: 0.3, walkTimeMin: 4 } },
          { name: 'teamLab Planets Digital Museum', durationMinutes: 120, bestTime: 'Afternoon', description: 'Walk through water and mirror digital light art installations.', isOutdoor: false, category: 'adventure', nearestMetro: { stationName: 'Shin-Toyosu', distanceKm: 0.2, walkTimeMin: 3 } }
        ]
      }
    ]
  },
  {
    id: 'insp-dubai-luxury',
    destination: 'Dubai',
    durationDays: 3,
    persona: 'Luxury',
    title: 'Dubai — Modern & Luxury',
    tag: 'Luxury • Sky',
    description: 'World’s tallest towers, luxury shopping malls, and private desert safari experiences.',
    highlights: ['Burj Khalifa', 'Dubai Mall', 'Desert Safari', 'Gold Souk'],
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    pace: 'Balanced',
    interests: ['Shopping', 'Adventure'],
    days: [
      {
        dayNumber: 1,
        title: 'Downtown Skyscrapers & Fountains',
        weatherForecast: { tempC: 34, condition: 'Sunny', rainProbability: 0, suitability: 'High', icon: '☀️' },
        activities: [
          { name: 'Burj Khalifa At The Top Deck', durationMinutes: 90, bestTime: 'Morning', description: 'Observation deck on 124th floor overlooking Dubai skyline.', isOutdoor: false, category: 'culture', nearestMetro: { stationName: 'Burj Khalifa/Dubai Mall', distanceKm: 0.8, walkTimeMin: 10 } },
          { name: 'Dubai Mall & Aquarium', durationMinutes: 150, bestTime: 'Afternoon', description: 'World class luxury shopping center with giant indoor aquarium tank.', isOutdoor: false, category: 'shopping', nearestMetro: { stationName: 'Burj Khalifa/Dubai Mall', distanceKm: 0.5, walkTimeMin: 6 } }
        ]
      }
    ]
  }
];

export default function InspirationPage() {
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [customizeModalTrip, setCustomizeModalTrip] = useState<InspirationTrip | null>(null);
  const [customPersona, setCustomPersona] = useState<Persona>('Backpacker');
  const [loading, setLoading] = useState(false);

  const tags = ['All', 'Popular • Heritage', 'Street Food • Budget', 'Classic • Museums', 'Art • Fine Dining', 'Future • Shrines', 'Luxury • Sky'];

  const filteredTrips = selectedTag === 'All'
    ? INSPIRATION_TRIPS
    : INSPIRATION_TRIPS.filter(t => t.tag === selectedTag);

  const handleUseTrip = async (inspTrip: InspirationTrip) => {
    const tripId = `trip-${Date.now()}`;
    const shareId = `share-${Math.random().toString(36).substring(2, 9)}`;

    const newTrip: Trip = {
      id: tripId,
      shareId,
      destination: inspTrip.destination,
      latitude: inspTrip.days[0]?.activities[0]?.lat || 28.6139,
      longitude: inspTrip.days[0]?.activities[0]?.lng || 77.2090,
      durationDays: inspTrip.durationDays,
      persona: inspTrip.persona,
      pace: inspTrip.pace,
      interests: inspTrip.interests,
      weatherSummary: {
        city: inspTrip.destination,
        avgTempC: 25,
        overallCondition: 'Pleasant & Clear',
        maxRainProbability: 10,
        suitabilityScore: 'High'
      },
      days: inspTrip.days,
      healthScore: {
        score: 95,
        label: 'Exceptional',
        factors: [{ text: 'Curated high-suitability route highlights', type: 'positive' }]
      },
      createdAt: new Date().toISOString()
    };

    // Save to LocalStorage
    try {
      const stored = localStorage.getItem('tripwise_saved_trips');
      let existing: Trip[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem('tripwise_saved_trips', JSON.stringify([newTrip, ...existing]));
    } catch (e) {}

    // Save to Supabase if logged in
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('trips').insert({
          id: newTrip.id,
          share_id: newTrip.shareId,
          destination: newTrip.destination,
          latitude: newTrip.latitude,
          longitude: newTrip.longitude,
          duration: newTrip.durationDays,
          persona: newTrip.persona,
          travel_pace: newTrip.pace,
          interests: newTrip.interests,
          itinerary: newTrip.days,
          weather_summary: newTrip.weatherSummary,
          trip_score: newTrip.healthScore
        });
      }
    } catch (e) {}

    router.push(`/trip/${shareId}`);
  };

  const handleMakeItMyOwn = async () => {
    if (!customizeModalTrip) return;
    setLoading(true);

    try {
      // Call Express Backend Gemini customization endpoint
      const response = await fetch('/api/inspiration/make-my-own', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspirationTrip: customizeModalTrip,
          newPersona: customPersona,
          newInterests: customizeModalTrip.interests
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.trip) {
          // Save locally
          try {
            const stored = localStorage.getItem('tripwise_saved_trips');
            let existing: Trip[] = stored ? JSON.parse(stored) : [];
            localStorage.setItem('tripwise_saved_trips', JSON.stringify([data.trip, ...existing]));
          } catch (e) {}

          router.push(`/trip/${data.trip.shareId || data.trip.id}`);
          return;
        }
      }

      // Direct Fallback if backend API call fails
      await handleUseTrip({ ...customizeModalTrip, persona: customPersona });
    } catch (err) {
      await handleUseTrip({ ...customizeModalTrip, persona: customPersona });
    } finally {
      setLoading(false);
      setCustomizeModalTrip(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#131314] font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-10 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="tw-badge tw-badge-amber">
            <SparklesIcon size={14} className="text-amber-600" /> Mindtrip Inspiration Library
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-[#131314]">
            TripWise Inspiration
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            Browse curated destination itineraries crafted by travel experts. Click &quot;Use This Trip&quot; or &quot;Make It My Own&quot; to customize.
          </p>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedTag === tag
                  ? 'bg-[#131314] text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[#131314]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Inspiration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="tw-card-lift overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Photo Stage */}
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={trip.imageUrl}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 tw-badge tw-badge-amber">
                    <MapPinIcon size={12} className="text-amber-600" /> {trip.destination}
                  </div>
                  <div className="absolute top-3 right-3 tw-badge bg-white/95 text-[#131314] font-extrabold">
                    {trip.durationDays} Days
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
                    <UserIcon size={12} className="text-amber-600" /> {trip.persona} Persona • {trip.pace} Pace
                  </div>

                  <h3 className="text-xl font-extrabold font-display text-[#131314]">
                    {trip.title}
                  </h3>

                  <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">
                    {trip.description}
                  </p>

                  {/* Highlights List */}
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[10px] font-extrabold text-[var(--muted)] uppercase tracking-wider">Highlights:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {trip.highlights.map((h, i) => (
                        <span key={i} className="tw-badge text-[11px] bg-[var(--surface)] border border-[var(--border)]">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 grid grid-cols-2 gap-2 border-t border-[var(--border)] mt-4">
                <button
                  onClick={() => setCustomizeModalTrip(trip)}
                  className="tw-btn-secondary text-xs !py-2.5 !px-3"
                >
                  <SparklesIcon size={14} className="text-amber-600" />
                  <span>Make It My Own</span>
                </button>
                <button
                  onClick={() => handleUseTrip(trip)}
                  className="tw-btn-primary text-xs !py-2.5 !px-3"
                >
                  <span>Use This Trip</span>
                  <ArrowRightIcon size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* "MAKE IT MY OWN" AI CUSTOMIZATION MODAL */}
      {customizeModalTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="tw-card p-6 sm:p-8 max-w-lg w-full space-y-5 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2 font-extrabold font-display text-[#131314] text-base">
                <SparklesIcon size={18} className="text-amber-600" /> Personalize with Gemini AI
              </div>
              <button
                onClick={() => setCustomizeModalTrip(null)}
                className="text-[var(--muted)] hover:text-[#131314] text-xs p-1.5 rounded-lg hover:bg-[var(--surface)]"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="tw-eyebrow">Original Itinerary</span>
                <h4 className="font-extrabold text-sm text-[#131314] font-display">{customizeModalTrip.title}</h4>
              </div>

              <div>
                <label className="block tw-eyebrow mb-2">Select Your Persona</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Backpacker', 'Family', 'Luxury', 'Explorer'] as Persona[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCustomPersona(p)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        customPersona === p
                          ? 'bg-[#131314] text-white border-[#131314]'
                          : 'bg-[var(--surface)] border-[var(--border)] text-[#131314] hover:bg-[var(--surface-2)]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Gemini AI will customize activity descriptions and scheduling to perfectly match your target traveler profile.
              </p>
            </div>

            <button
              onClick={handleMakeItMyOwn}
              disabled={loading}
              className="tw-btn-primary w-full !py-3 text-xs"
            >
              {loading ? (
                <>
                  <CompassIcon size={16} className="animate-spin text-white" />
                  <span>Customizing with Gemini...</span>
                </>
              ) : (
                <>
                  <SparklesIcon size={16} className="text-amber-400" />
                  <span>Generate Custom Version</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
