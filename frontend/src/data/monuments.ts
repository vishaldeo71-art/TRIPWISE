export interface MonumentFeature {
  id: string;
  name: string;
  category: 'Architecture' | 'History' | 'Culture';
  isMustSee?: boolean;
  lat: number;
  lng: number;
  altitudeOffset?: number;
  description: string;
  historicalImportance: string;
  architecturalImportance: string;
  whyVisit: string;
  cameraPitch?: number;
  cameraHeading?: number;
}

export interface Monument {
  id: string;
  name: string;
  cityName: string;
  country: string;
  lat: number;
  lng: number;
  altitude?: number;
  builtYear: string;
  architecturalStyle: string;
  description: string;
  overviewImage: string;
  features: MonumentFeature[];
}

export const MONUMENTS_REGISTRY: Record<string, Monument[]> = {
  delhi: [
    {
      id: 'red-fort',
      name: 'Red Fort (Lal Qila)',
      cityName: 'Delhi',
      country: 'India',
      lat: 28.6562,
      lng: 77.2410,
      altitude: 180,
      builtYear: '1638–1648 AD',
      architecturalStyle: 'Mughal & Indo-Islamic Architecture',
      description: 'The iconic 17th-century red sandstone fortress commissioned by Mughal Emperor Shah Jahan, representing the pinnacle of Mughal architectural splendour.',
      overviewImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      features: [
        {
          id: 'lahori-gate',
          name: 'Lahori Gate',
          category: 'Architecture',
          isMustSee: true,
          lat: 28.6560,
          lng: 77.2400,
          description: 'The monumental main entrance to the Red Fort, named for its orientation towards the historic city of Lahore.',
          historicalImportance: 'Symbolic site where the Prime Minister of India unfurls the national flag on Independence Day every 15th of August.',
          architecturalImportance: 'Framed by grand octagonal towers, flame-shaped battlements, and white marble cupolas (chhatris).',
          whyVisit: 'Offers a breathtaking first view of the fort and leads into the historic Chhatta Chowk covered bazaar.',
          cameraPitch: -25,
          cameraHeading: 90
        },
        {
          id: 'diwan-i-am',
          name: 'Diwan-i-Am (Hall of Public Audience)',
          category: 'History',
          isMustSee: true,
          lat: 28.6565,
          lng: 77.2418,
          description: 'The ceremonial hall where Emperor Shah Jahan met members of the general public and heard their petitions.',
          historicalImportance: 'Housed the ornate marble throne canopy (Jharokha) where the emperor presided in state.',
          architecturalImportance: 'Features a large hall with 9 archways supported by red sandstone pillars with intricate Pietra Dura stone inlays.',
          whyVisit: 'Witness fine Florentine pietra dura artwork depicting Orpheus playing the lute behind the royal throne seat.',
          cameraPitch: -20,
          cameraHeading: 120
        },
        {
          id: 'diwan-i-khas',
          name: 'Diwan-i-Khas (Hall of Private Audience)',
          category: 'Architecture',
          isMustSee: true,
          lat: 28.6568,
          lng: 77.2428,
          description: 'The luxurious pavilion where the Mughal emperor received ambassadors, royal guests, and senior ministers.',
          historicalImportance: 'Original resting location of the legendary solid gold Peacock Throne (Takht-i-Taus) inset with the Koh-i-Noor diamond.',
          architecturalImportance: 'Crafted from pure white marble with gold leaf foil ceilings and silver-encrusted marble pillars.',
          whyVisit: 'Inscribed with the famous Persian poem line: "If there be a paradise on earth, it is this, it is this, it is this."',
          cameraPitch: -15,
          cameraHeading: 45
        },
        {
          id: 'naubat-khana',
          name: 'Naubat Khana (Drum House)',
          category: 'History',
          isMustSee: false,
          lat: 28.6561,
          lng: 77.2408,
          description: 'The royal music gallery where court musicians played ceremonial music five times daily to announce royal arrivals.',
          historicalImportance: 'All visitors except the emperor were required to dismount their horses and elephants here before proceeding on foot.',
          architecturalImportance: 'Double-storied red sandstone pavilion with carved floral motifs and vaulted acoustics.',
          whyVisit: 'Houses the Indian War Memorial Museum showcasing historic armor, weapons, and royal artifacts.',
          cameraPitch: -30,
          cameraHeading: 180
        },
        {
          id: 'moti-masjid',
          name: 'Moti Masjid (Pearl Mosque)',
          category: 'Architecture',
          isMustSee: false,
          lat: 28.6572,
          lng: 77.2430,
          description: 'A small, pristine white marble mosque added to the fort complex by Emperor Aurangzeb in 1659.',
          historicalImportance: 'Served as the private chapel for Emperor Aurangzeb and royal family members.',
          architecturalImportance: 'Features three bulbous domes, carved marble screens (jalis), and black marble prayer floor contours.',
          whyVisit: 'A masterpiece of compact marble symmetry tucked quietly within the royal quarter.',
          cameraPitch: -10,
          cameraHeading: 310
        }
      ]
    },
    {
      id: 'qutub-minar',
      name: 'Qutub Minar Complex',
      cityName: 'Delhi',
      country: 'India',
      lat: 28.5245,
      lng: 77.1855,
      altitude: 175,
      builtYear: '1192–1220 AD',
      architecturalStyle: 'Early Indo-Islamic Architecture',
      description: 'The world’s tallest brick minaret standing at 72.5 meters, surrounded by ancient Hindu and Jain temple ruins and Islamic monuments.',
      overviewImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
      features: [
        {
          id: 'minaret-column',
          name: 'Qutub Minar Victory Tower',
          category: 'Architecture',
          isMustSee: true,
          lat: 28.5245,
          lng: 77.1855,
          description: 'A 5-storey fluted red sandstone and marble minaret built by Qutb-ud-din Aibak and Iltutmish.',
          historicalImportance: 'Celebrated the establishment of the Delhi Sultanate in Northern India.',
          architecturalImportance: 'Decreasing diameter from 14.3m at the base to 2.7m at the peak, covered in band inscriptions of Quranic verses.',
          whyVisit: 'Admire intricate calligraphy carved into red sandstone tapering gracefully into the blue sky.',
          cameraPitch: -35,
          cameraHeading: 0
        },
        {
          id: 'quwwat-ul-islam',
          name: 'Quwwat-ul-Islam Mosque',
          category: 'History',
          isMustSee: true,
          lat: 28.5248,
          lng: 77.1852,
          description: 'The oldest surviving mosque in North India, built using carved pillars from 27 dismantled ancient temples.',
          historicalImportance: 'Marked the transition of Indian architectural craftsmanship under Sultanate rule.',
          architecturalImportance: 'Hypostyle courtyard with carved stone pillars displaying floral, bell, and geometric motifs.',
          whyVisit: 'Fascinating blend of early Indian stone carving combined with Islamic arched screen facades.',
          cameraPitch: -20,
          cameraHeading: 270
        },
        {
          id: 'iron-pillar',
          name: 'Rustless Iron Pillar of Delhi',
          category: 'History',
          isMustSee: true,
          lat: 28.5247,
          lng: 77.1853,
          description: 'A 7.2-meter metallurgical marvel forged during the Gupta Empire around 400 AD that has withstood 1,600 years without rusting.',
          historicalImportance: 'Dedicated to Lord Vishnu by Emperor Chandragupta II (Vikramaditya).',
          architecturalImportance: 'Forged from wrought iron with high phosphorus content content creating a protective passive oxide layer.',
          whyVisit: 'Scientists worldwide still study its rust-resistant metallurgical composition.',
          cameraPitch: -15,
          cameraHeading: 135
        },
        {
          id: 'alai-darwaza',
          name: 'Alai Darwaza Gate',
          category: 'Architecture',
          isMustSee: false,
          lat: 28.5242,
          lng: 77.1857,
          description: 'The magnificent southern gateway added by Sultan Alauddin Khalji in 1311 AD.',
          historicalImportance: 'First building in India constructed using true Islamic horseshoe arch principles.',
          architecturalImportance: 'Decorated with red sandstone, white marble latticework screens, and domed roof symmetry.',
          whyVisit: 'Showcases the highest artistic craftsmanship of the Khalji dynasty.',
          cameraPitch: -25,
          cameraHeading: 210
        }
      ]
    },
    {
      id: 'humayun-tomb',
      name: "Humayun's Tomb",
      cityName: 'Delhi',
      country: 'India',
      lat: 28.5849,
      lng: 77.2507,
      altitude: 190,
      builtYear: '1565–1572 AD',
      architecturalStyle: 'Persian Mughal Garden Tomb',
      description: 'The grand UNESCO World Heritage garden tomb commissioned by Empress Bega Begum that inspired the design of the Taj Mahal.',
      overviewImage: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe707?auto=format&fit=crop&w=1200&q=80',
      features: [
        {
          id: 'main-white-dome',
          name: 'Double White Marble Dome',
          category: 'Architecture',
          isMustSee: true,
          lat: 28.5849,
          lng: 77.2507,
          description: 'The 42-meter high double-layered white marble dome crowning the central burial chamber.',
          historicalImportance: 'First major double dome structure built in the Indian subcontinent.',
          architecturalImportance: 'Outer shell creates grand exterior scale while inner dome maintains proportionate interior ceiling height.',
          whyVisit: 'Stunning visual contrast between the pure white dome and red sandstone octagonal base.',
          cameraPitch: -30,
          cameraHeading: 60
        },
        {
          id: 'charbagh-gardens',
          name: 'Charbagh Persian Gardens',
          category: 'Culture',
          isMustSee: true,
          lat: 28.5845,
          lng: 77.2500,
          description: 'A 30-acre quadrilateral paradise garden divided by four flowing water channels symbolizing the rivers of Quranic Paradise.',
          historicalImportance: 'First garden-tomb created in India, establishing a centuries-long Mughal tradition.',
          architecturalImportance: 'Symmetrical geometric quadrants with causeways, sunken flower beds, and fountain basins.',
          whyVisit: 'Serene walking pathways offering peaceful views of the tomb reflected in water channels.',
          cameraPitch: -15,
          cameraHeading: 180
        },
        {
          id: 'arched-facade',
          name: 'Persian Iwan Arched Facade',
          category: 'Architecture',
          isMustSee: false,
          lat: 28.5852,
          lng: 77.2510,
          description: 'Deep vaulted archways (Iwans) with inlaid yellow and black marble geometric borders.',
          historicalImportance: 'Designed by Persian architect Mirak Mirza Ghiyas.',
          architecturalImportance: 'Combines Persian recessed arch symmetry with Indian chhatri pavilions.',
          whyVisit: 'Provides shade and breathtaking perspective photo angles across the gardens.',
          cameraPitch: -20,
          cameraHeading: 300
        }
      ]
    },
    {
      id: 'akshardham',
      name: 'Akshardham Temple',
      cityName: 'Delhi',
      country: 'India',
      lat: 28.6127,
      lng: 77.2773,
      altitude: 185,
      builtYear: '2005 AD',
      architecturalStyle: 'Traditional Hindu Temple Architecture',
      description: 'Spiritual campus showcasing thousands of years of traditional Indian culture, spirituality, and master stone architecture.',
      overviewImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
      features: [
        {
          id: 'gajendra-pith',
          name: 'Gajendra Pith (Elephant Plinth)',
          category: 'Architecture',
          isMustSee: true,
          lat: 28.6128,
          lng: 77.2774,
          description: 'A grand stone base featuring 148 full-sized carved stone elephants celebrating peace and harmony in ancient Indian lore.',
          historicalImportance: 'Honors peace, strength, and harmony in ancient Indian spiritual lore.',
          architecturalImportance: 'Carved from solid pink Rajasthani sandstone blocks without using steel or concrete reinforcement.',
          whyVisit: 'Admire 148 unique handcrafted stone elephant sculptures surrounding the temple base.',
          cameraPitch: -25,
          cameraHeading: 120
        },
        {
          id: 'mandovar-facade',
          name: 'Mandovar Carved Exterior Wall',
          category: 'Architecture',
          isMustSee: true,
          lat: 28.6126,
          lng: 77.2772,
          description: 'The intricately carved outer wall of the main monument featuring 200 carved stone figures of India’s ancient sages and deities.',
          historicalImportance: 'Restores ancient Vedic Shilpa Shastra stone architectural traditions.',
          architecturalImportance: 'Stands 25 feet high and stretches 611 feet long with pure pink sandstone craftsmanship.',
          whyVisit: 'View detailed hand-carved relief sculptures depicting stories from Indian heritage.',
          cameraPitch: -20,
          cameraHeading: 270
        }
      ]
    }
  ],
  london: [
    {
      id: 'tower-bridge',
      name: 'Tower Bridge',
      cityName: 'London',
      country: 'United Kingdom',
      lat: 51.5055,
      lng: -0.0754,
      altitude: 50,
      builtYear: '1886–1894 AD',
      architecturalStyle: 'Victorian Gothic Revival',
      description: 'The world-famous combined bascule and suspension bridge spanning the River Thames near the Tower of London.',
      overviewImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
      features: [
        {
          id: 'twin-gothic-towers',
          name: 'Twin Victorian Gothic Towers',
          category: 'Architecture',
          isMustSee: true,
          lat: 51.5055,
          lng: -0.0754,
          description: '65-meter tall steel frame towers clad in Cornish granite and Portland stone.',
          historicalImportance: 'Designed by Sir Horace Jones and Sir John Wolfe Barry to harmonize with the nearby Tower of London.',
          architecturalImportance: 'Houses the hydraulic lifts that raise the bridge bascules over 800 times a year for river traffic.',
          whyVisit: 'Iconic London skyline landmark with high-level glass floor walkways.',
          cameraPitch: -25,
          cameraHeading: 45
        },
        {
          id: 'glass-walkways',
          name: 'High-Level Glass Floor Walkway',
          category: 'Culture',
          isMustSee: true,
          lat: 51.5056,
          lng: -0.0754,
          description: '42 meters above the River Thames, featuring transparent glass floor panels.',
          historicalImportance: 'Originally designed for pedestrians when the bascules were raised.',
          architecturalImportance: 'Reinforced glass panels measuring 11m long by 1.8m wide capable of holding 6 elephants.',
          whyVisit: 'Look straight down at London red double-decker buses crossing the bridge below.',
          cameraPitch: -40,
          cameraHeading: 0
        },
        {
          id: 'engine-rooms',
          name: 'Victorian Steam Engine Rooms',
          category: 'History',
          isMustSee: false,
          lat: 51.5050,
          lng: -0.0750,
          description: 'Preserved steam engines and hydraulic accumulators that originally powered the bridge until 1976.',
          historicalImportance: 'Engineering marvel of 19th-century industrial technology.',
          architecturalImportance: 'Polished brass fittings, coal boilers, and massive drive wheels.',
          whyVisit: 'Immerse in the sights and sounds of London’s industrial heritage.',
          cameraPitch: -15,
          cameraHeading: 120
        }
      ]
    },
    {
      id: 'british-museum',
      name: 'The British Museum',
      cityName: 'London',
      country: 'United Kingdom',
      lat: 51.5194,
      lng: -0.1270,
      altitude: 60,
      builtYear: '1823–1852 AD',
      architecturalStyle: 'Greek Revival Architecture',
      description: 'A global museum housing over 8 million works chronicling human history, art, and culture from its beginnings to the present day.',
      overviewImage: 'https://images.unsplash.com/photo-1565060169194-1a65d5ef07ee?auto=format&fit=crop&w=1200&q=80',
      features: [
        {
          id: 'great-court',
          name: 'Queen Elizabeth II Great Court',
          category: 'Architecture',
          isMustSee: true,
          lat: 51.5194,
          lng: -0.1270,
          description: 'The largest covered public square in Europe, designed by Foster and Partners with a spectacular glass and steel roof.',
          historicalImportance: 'Opened in December 2000, transforming the central courtyard surrounding the historic Reading Room.',
          architecturalImportance: 'Tessellated glass canopy consisting of 3,312 unique glass panes spanning 2 acres.',
          whyVisit: 'Breathtaking light-filled central hub connecting all historic galleries.',
          cameraPitch: -30,
          cameraHeading: 90
        },
        {
          id: 'rosetta-stone',
          name: 'Rosetta Stone Gallery',
          category: 'History',
          isMustSee: true,
          lat: 51.5192,
          lng: -0.1275,
          description: 'The famous granodiorite stele inscribed with three scripts that unlocked the decipherment of ancient Egyptian hieroglyphs.',
          historicalImportance: 'Discovered in 1799 in Egypt and housed in the museum since 1802.',
          architecturalImportance: 'Display casing with controlled humidity and anti-reflective protective casing.',
          whyVisit: 'The most visited single artifact in the British Museum.',
          cameraPitch: -15,
          cameraHeading: 180
        }
      ]
    }
  ],
  paris: [
    {
      id: 'eiffel-tower',
      name: 'Eiffel Tower (La Tour Eiffel)',
      cityName: 'Paris',
      country: 'France',
      lat: 48.8584,
      lng: 2.2945,
      altitude: 330,
      builtYear: '1887–1889 AD',
      architecturalStyle: 'Wrought-Iron Lattice Tower',
      description: 'The world-famous 330-meter wrought-iron lattice tower on the Champ de Mars, built for the 1889 World’s Fair by Gustave Eiffel.',
      overviewImage: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
      features: [
        {
          id: 'lattice-structure',
          name: 'Puddle Iron Lattice Architecture',
          category: 'Architecture',
          isMustSee: true,
          lat: 48.8584,
          lng: 2.2945,
          description: 'Assembled from 18,038 metallic parts held together by 2.5 million rivets.',
          historicalImportance: 'Built to celebrate the centennial of the French Revolution at the 1889 Exposition Universelle.',
          architecturalImportance: 'Wind-resistant geometric openwork lattice design that sways only a maximum of 9 cm in high storms.',
          whyVisit: 'Marvel at 19th-century French precision structural engineering.',
          cameraPitch: -45,
          cameraHeading: 30
        },
        {
          id: 'summit-deck',
          name: 'Summit Panoramic Deck',
          category: 'Culture',
          isMustSee: true,
          lat: 48.8584,
          lng: 2.2945,
          description: 'The highest accessible observation platform in the European Union at 276 meters.',
          historicalImportance: 'Contains Gustave Eiffel’s restored private office with wax models of Eiffel and Thomas Edison.',
          architecturalImportance: 'Enclosed indoor deck and outdoor upper balcony with champagne bar.',
          whyVisit: 'Offers unparalleled 360-degree views over Paris landmarks.',
          cameraPitch: -20,
          cameraHeading: 180
        }
      ]
    },
    {
      id: 'louvre-museum',
      name: 'Louvre Museum (Musée du Louvre)',
      cityName: 'Paris',
      country: 'France',
      lat: 48.8606,
      lng: 2.3376,
      altitude: 45,
      builtYear: '12th Century–1989 AD',
      architecturalStyle: 'French Renaissance & Modern Glass Pyramid',
      description: 'The world’s largest art museum and historic palace of French kings, housing the Mona Lisa and Venus de Milo.',
      overviewImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
      features: [
        {
          id: 'glass-pyramid',
          name: 'Louvre Glass Pyramid (Pyramide du Louvre)',
          category: 'Architecture',
          isMustSee: true,
          lat: 48.8606,
          lng: 2.3376,
          description: 'The iconic 21-meter high glass and metal pyramid entrance designed by architect I. M. Pei in 1989.',
          historicalImportance: 'Commissioned by President François Mitterrand to modernize the museum entrances.',
          architecturalImportance: 'Constructed from 603 rhombus and 70 triangular glass segments with ultra-clear diamond glass.',
          whyVisit: 'Stunning fusion of modern glass architecture contrasting against classical French Renaissance palace facades.',
          cameraPitch: -25,
          cameraHeading: 220
        },
        {
          id: 'mona-lisa-gallery',
          name: 'Salle des États (Mona Lisa Gallery)',
          category: 'History',
          isMustSee: true,
          lat: 48.8603,
          lng: 2.3368,
          description: 'The grand gallery displaying Leonardo da Vinci’s world-famous portrait of Lisa Gherardini (Mona Lisa).',
          historicalImportance: 'Acquired by King Francis I of France in 1518.',
          architecturalImportance: 'Bulletproof climate-controlled glass enclosure with directional lighting.',
          whyVisit: 'See the world’s most celebrated masterpiece in person.',
          cameraPitch: -15,
          cameraHeading: 90
        }
      ]
    }
  ]
};

/**
 * Get monuments for a specific city or return default Delhi registry
 */
export function getMonumentsForCity(city: string): Monument[] {
  const normalized = (city || 'delhi').toLowerCase().trim();
  for (const key of Object.keys(MONUMENTS_REGISTRY)) {
    if (normalized.includes(key)) {
      return MONUMENTS_REGISTRY[key];
    }
  }
  return MONUMENTS_REGISTRY.delhi;
}

/**
 * Find specific monument by ID across all cities
 */
export function getMonumentById(monumentId: string): { monument: Monument; cityKey: string } | null {
  const normId = (monumentId || '').toLowerCase().trim();
  for (const [cityKey, monuments] of Object.entries(MONUMENTS_REGISTRY)) {
    const match = monuments.find((m) => m.id === normId || m.name.toLowerCase().includes(normId));
    if (match) return { monument: match, cityKey };
  }
  return null;
}
