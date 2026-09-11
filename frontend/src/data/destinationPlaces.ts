import { Activity, Persona } from '@/types/trip';

export interface MetroStation {
  name: string;
  line?: string;
  lat: number;
  lng: number;
}

export interface DestinationData {
  cityName: string;
  country: string;
  hasMetro: boolean;
  transitSystemName: string; // e.g. "Delhi Metro", "London Underground (Tube)", "Paris Métro"
  centerLat: number;
  centerLng: number;
  metroStations: MetroStation[];
  places: Omit<Activity, 'id'>[];
}

export const DESTINATION_REGISTRY: Record<string, DestinationData> = {
  delhi: {
    cityName: 'Delhi',
    country: 'India',
    hasMetro: true,
    transitSystemName: 'Delhi Metro',
    centerLat: 28.6139,
    centerLng: 77.209,
    metroStations: [
      { name: 'Lal Qila', line: 'Violet Line', lat: 28.6562, lng: 77.2410 },
      { name: 'Jama Masjid', line: 'Violet Line', lat: 28.6510, lng: 77.2340 },
      { name: 'Chandni Chowk', line: 'Yellow Line', lat: 28.6575, lng: 77.2305 },
      { name: 'Central Secretariat', line: 'Yellow / Violet Line', lat: 28.6185, lng: 77.2132 },
      { name: 'JL Nehru Stadium', line: 'Violet Line', lat: 28.5900, lng: 77.2330 },
      { name: 'Qutab Minar', line: 'Yellow Line', lat: 28.5245, lng: 77.1855 },
      { name: 'Supreme Court (Pragati Maidan)', line: 'Blue Line', lat: 28.6225, lng: 77.2435 },
      { name: 'INAS', line: 'Yellow Line', lat: 28.5740, lng: 77.2095 },
      { name: 'Khan Market', line: 'Violet Line', lat: 28.6005, lng: 77.2270 },
      { name: 'Patel Chowk', line: 'Yellow Line', lat: 28.6230, lng: 77.2140 }
    ],
    places: [
      {
        name: 'Red Fort & Old Delhi Heritage Walk',
        category: 'culture',
        isOutdoor: true,
        durationMinutes: 120,
        bestTime: 'Morning',
        description: 'Explore the 17th-century Mughal fortress built by Emperor Shah Jahan, featuring red sandstone walls, Diwan-i-Aam, and Diwan-i-Khas.',
        estimatedTravelTime: '🚶 10 min walk',
        weatherSuitability: 'High',
        personaSuitability: ['Explorer', 'Backpacker', 'Family', 'Solo Explorer'],
        whySelectedReason: 'Iconic UNESCO heritage landmark located in the historic heart of Old Delhi.',
        lat: 28.6562,
        lng: 77.2410,
        indoorAlternative: {
          name: 'National Museum New Delhi',
          description: 'Explore climate-controlled galleries housing Harappan relics, ancient bronzes, and Mughal miniature paintings.',
          durationMinutes: 120,
          category: 'indoor_museum'
        }
      },
      {
        name: 'Humayun’s Tomb & Mughal Gardens',
        category: 'culture',
        isOutdoor: true,
        durationMinutes: 90,
        bestTime: 'Morning',
        description: 'Marvel at the precursor to the Taj Mahal, featuring grand Persian garden layouts, intricate marble latticework, and royal mausoleums.',
        estimatedTravelTime: '🚗 15 min drive',
        weatherSuitability: 'High',
        personaSuitability: ['Explorer', 'Family', 'Luxury', 'Solo Explorer'],
        whySelectedReason: 'Masterpiece of Mughal architecture surrounded by lush symmetrical charbagh gardens.',
        lat: 28.5893,
        lng: 77.2507,
        indoorAlternative: {
          name: 'Kiran Nadar Museum of Art',
          description: 'Contemporary indoor art gallery featuring modern Indian art masterpieces.',
          durationMinutes: 90,
          category: 'indoor_museum'
        }
      },
      {
        name: 'Qutub Minar & Mehrauli Archaeological Park',
        category: 'culture',
        isOutdoor: true,
        durationMinutes: 105,
        bestTime: 'Afternoon',
        description: 'Stand beneath the world’s tallest brick minaret (73m), surrounded by 12th-century ruins and the rust-resistant Iron Pillar of Delhi.',
        estimatedTravelTime: '🚗 20 min drive',
        weatherSuitability: 'High',
        personaSuitability: ['Explorer', 'Backpacker', 'Solo Explorer'],
        whySelectedReason: 'Ancient 12th-century Indo-Islamic architectural complex with unmatched historical depth.',
        lat: 28.5245,
        lng: 77.1855,
        indoorAlternative: {
          name: 'Crafts Museum & Indoor Textile Pavilion',
          description: 'Air-conditioned indoor village craft gallery showcasing traditional Indian handlooms and folk art.',
          durationMinutes: 105,
          category: 'indoor_museum'
        }
      },
      {
        name: 'Akshardham Temple & Cultural Courtyards',
        category: 'culture',
        isOutdoor: true,
        durationMinutes: 120,
        bestTime: 'Afternoon',
        description: 'Experience handcrafted sandstone carvings, boat rides depicting ancient Indian history, and grand spiritual halls.',
        estimatedTravelTime: '🚗 15 min drive',
        weatherSuitability: 'High',
        personaSuitability: ['Family', 'Explorer', 'Luxury'],
        whySelectedReason: 'Spectacular modern temple showcase of traditional Indian art, culture, and architecture.',
        lat: 28.6127,
        lng: 77.2773,
        indoorAlternative: {
          name: 'Akshardham Sanskruti Vihar Indoor Exhibition',
          description: 'Immersive indoor audio-visual boat ride and animatronic historical walk inside Akshardham complex.',
          durationMinutes: 90,
          category: 'indoor_entertainment'
        }
      },
      {
        name: 'Gurudwara Bangla Sahib & Community Kitchen (Langar)',
        category: 'culture',
        isOutdoor: false,
        durationMinutes: 75,
        bestTime: 'Morning',
        description: 'Visit Delhi’s most prominent Sikh house of worship, admire the golden dome and sacred pool, and observe the Mega Langar kitchen.',
        estimatedTravelTime: '🚶 12 min walk',
        weatherSuitability: 'Indoor Only',
        personaSuitability: ['Backpacker', 'Family', 'Explorer', 'Solo Explorer', 'Luxury'],
        whySelectedReason: 'Deep spiritual atmosphere and inspiring selfless community service experience.',
        lat: 28.6264,
        lng: 77.2091
      },
      {
        name: 'Chandni Chowk Street Food & Paranthe Wali Gali',
        category: 'food',
        isOutdoor: true,
        durationMinutes: 90,
        bestTime: 'Afternoon',
        description: 'Taste authentic stuffed paranthas, Jalebi, Daulat ki Chaat, and spicy street snacks in 300-year-old market alleys.',
        estimatedTravelTime: '🚶 5 min walk',
        weatherSuitability: 'Moderate',
        personaSuitability: ['Backpacker', 'Explorer', 'Solo Explorer'],
        whySelectedReason: 'The legendary epicenter of Old Delhi’s culinary heritage.',
        lat: 28.6575,
        lng: 77.2305,
        indoorAlternative: {
          name: 'Haveli Dharampura Indoor Culinary Experience',
          description: 'Dine inside a restored 19th-century Mughal haveli serving refined Old Delhi cuisine.',
          durationMinutes: 90,
          category: 'food'
        }
      },
      {
        name: 'Dilli Haat Food & Craft Bazaar',
        category: 'shopping',
        isOutdoor: true,
        durationMinutes: 105,
        bestTime: 'Evening',
        description: 'Open-air village market showcasing regional handicraft stalls from 28 Indian states alongside regional food pavilions.',
        estimatedTravelTime: '🚗 15 min drive',
        weatherSuitability: 'Moderate',
        personaSuitability: ['Family', 'Backpacker', 'Explorer', 'Luxury'],
        whySelectedReason: 'Curated blend of state handicrafts and authentic regional Indian food stalls.',
        lat: 28.5740,
        lng: 77.2095,
        indoorAlternative: {
          name: 'Khan Market Boutique Galleria',
          description: 'Explore air-conditioned bookstores, designer boutiques, and upscale indoor cafés.',
          durationMinutes: 105,
          category: 'shopping'
        }
      },
      {
        name: 'Lodhi Art District & Botanical Gardens',
        category: 'nature',
        isOutdoor: true,
        durationMinutes: 90,
        bestTime: 'Morning',
        description: 'Stroll past massive contemporary street art murals by international artists, followed by serene walks around 15th-century Sayyid tombs.',
        estimatedTravelTime: '🚶 10 min walk',
        weatherSuitability: 'High',
        personaSuitability: ['Solo Explorer', 'Backpacker', 'Explorer', 'Family'],
        whySelectedReason: 'Vibrant outdoor open-air art gallery blended with historical green spaces.',
        lat: 28.5932,
        lng: 77.2197,
        indoorAlternative: {
          name: 'India Habitat Centre Visual Arts Gallery',
          description: 'Contemporary indoor art exhibition spaces and cultural courtyard complex.',
          durationMinutes: 90,
          category: 'indoor_museum'
        }
      }
    ]
  },
  london: {
    cityName: 'London',
    country: 'United Kingdom',
    hasMetro: true,
    transitSystemName: 'London Underground (Tube)',
    centerLat: 51.5074,
    centerLng: -0.1278,
    metroStations: [
      { name: 'Westminster', line: 'Jubilee / District / Circle', lat: 51.5010, lng: -0.1250 },
      { name: 'Tower Hill', line: 'District / Circle', lat: 51.5098, lng: -0.0765 },
      { name: 'Waterloo', line: 'Jubilee / Northern / Bakerloo', lat: 51.5036, lng: -0.1143 },
      { name: 'Tottenham Court Road', line: 'Central / Northern / Elizabeth', lat: 51.5165, lng: -0.1310 },
      { name: 'South Kensington', line: 'Piccadilly / District / Circle', lat: 51.4941, lng: -0.1738 },
      { name: 'Covent Garden', line: 'Piccadilly Line', lat: 51.5129, lng: -0.1243 },
      { name: 'London Bridge', line: 'Jubilee / Northern', lat: 51.5057, lng: -0.0868 },
      { name: 'Green Park', line: 'Piccadilly / Victoria / Jubilee', lat: 51.5067, lng: -0.1428 }
    ],
    places: [
      {
        name: 'Big Ben & Houses of Parliament',
        category: 'culture',
        isOutdoor: true,
        durationMinutes: 90,
        bestTime: 'Morning',
        description: 'Admire Elizabeth Tower (Big Ben) and Gothic Revival architecture along Parliament Square and Westminster Bridge.',
        estimatedTravelTime: '🚶 5 min walk',
        weatherSuitability: 'High',
        personaSuitability: ['Explorer', 'Backpacker', 'Family', 'Solo Explorer'],
        whySelectedReason: 'The world-famous political and architectural heart of London.',
        lat: 51.5007,
        lng: -0.1246,
        indoorAlternative: {
          name: 'Westminster Abbey Historic Tour',
          description: 'Step inside the historic coronation church of British monarchs dating back to 1066.',
          durationMinutes: 90,
          category: 'indoor_museum'
        }
      },
      {
        name: 'Tower of London & Tower Bridge Promenade',
        category: 'culture',
        isOutdoor: true,
        durationMinutes: 120,
        bestTime: 'Morning',
        description: 'Discover 1,000 years of royal history, see the Crown Jewels, and walk across iconic Tower Bridge.',
        estimatedTravelTime: '🚶 10 min walk',
        weatherSuitability: 'High',
        personaSuitability: ['Explorer', 'Family', 'Luxury', 'Solo Explorer'],
        whySelectedReason: 'Historic Norman fortress housing royal heritage beside the Thames River.',
        lat: 51.5081,
        lng: -0.0759,
        indoorAlternative: {
          name: 'Tower of London Crown Jewels Exhibition',
          description: 'Explore the highly secure indoor vaults displaying the priceless royal regalia and crowns.',
          durationMinutes: 90,
          category: 'indoor_museum'
        }
      },
      {
        name: 'British Museum & Great Court',
        category: 'culture',
        isOutdoor: false,
        durationMinutes: 120,
        bestTime: 'Afternoon',
        description: 'Discover world history treasures including the Rosetta Stone, Egyptian mummies, and Parthenon Sculptures beneath the glass canopy.',
        estimatedTravelTime: '🚶 8 min walk',
        weatherSuitability: 'Indoor Only',
        personaSuitability: ['Backpacker', 'Explorer', 'Family', 'Solo Explorer', 'Luxury'],
        whySelectedReason: 'One of the world’s premier museum collections spanning human civilization.',
        lat: 51.5194,
        lng: -0.1270
      },
      {
        name: 'The London Eye & South Bank Promenade',
        category: 'nature',
        isOutdoor: true,
        durationMinutes: 90,
        bestTime: 'Evening',
        description: 'Take a flight on Europe’s tallest cantilevered observation wheel for 360-degree views of the Thames skyline.',
        estimatedTravelTime: '🚶 10 min walk',
        weatherSuitability: 'High',
        personaSuitability: ['Family', 'Luxury', 'Explorer'],
        whySelectedReason: 'Unrivaled panoramic vistas across London’s iconic riverfront landmarks.',
        lat: 51.5033,
        lng: -0.1195,
        indoorAlternative: {
          name: 'Tate Modern Art Galleries',
          description: 'Explore world-class modern art exhibitions inside the monumental converted power station.',
          durationMinutes: 90,
          category: 'indoor_museum'
        }
      },
      {
        name: 'Borough Market Artisan Food Tasting',
        category: 'food',
        isOutdoor: true,
        durationMinutes: 105,
        bestTime: 'Afternoon',
        description: 'Sample gourmet artisan cheeses, fresh seafood, British pies, and international street foods under railway arches.',
        estimatedTravelTime: '🚶 5 min walk',
        weatherSuitability: 'Moderate',
        personaSuitability: ['Backpacker', 'Explorer', 'Solo Explorer', 'Luxury'],
        whySelectedReason: 'London’s oldest food market operating for over 1,000 years.',
        lat: 51.5055,
        lng: -0.0905,
        indoorAlternative: {
          name: 'Seven Dials Market Covered Food Hall',
          description: 'Vibrant indoor food hall in Covent Garden featuring 19 independent food vendors.',
          durationMinutes: 90,
          category: 'food'
        }
      },
      {
        name: 'Covent Garden Street Performers & Piazza',
        category: 'shopping',
        isOutdoor: true,
        durationMinutes: 90,
        bestTime: 'Evening',
        description: 'Watch world-class street entertainers, explore Apple Market craft stalls, and enjoy boutique shops.',
        estimatedTravelTime: '🚶 8 min walk',
        weatherSuitability: 'Moderate',
        personaSuitability: ['Family', 'Backpacker', 'Explorer'],
        whySelectedReason: 'Lively cultural square filled with street theatre, fashion, and dining.',
        lat: 51.5117,
        lng: -0.1240,
        indoorAlternative: {
          name: 'Royal Opera House Grand Foyer & Cafe',
          description: 'Experience indoor opera foyer architecture, historic exhibitions, and coffee.',
          durationMinutes: 75,
          category: 'indoor_entertainment'
        }
      },
      {
        name: 'Hyde Park & Kensington Gardens Stroll',
        category: 'nature',
        isOutdoor: true,
        durationMinutes: 90,
        bestTime: 'Morning',
        description: 'Walk past the Serpentine Lake, Diana Memorial Fountain, and royal palace gardens.',
        estimatedTravelTime: '🚗 12 min drive',
        weatherSuitability: 'High',
        personaSuitability: ['Family', 'Solo Explorer', 'Backpacker'],
        whySelectedReason: 'London’s famous 350-acre Royal Park green oasis.',
        lat: 51.5073,
        lng: -0.1657,
        indoorAlternative: {
          name: 'Natural History Museum Earth Hall',
          description: 'Marvel at blue whale skeletons, dinosaur fossils, and mineral galleries inside Romanesque halls.',
          durationMinutes: 105,
          category: 'indoor_museum'
        }
      }
    ]
  },
  paris: {
    cityName: 'Paris',
    country: 'France',
    hasMetro: true,
    transitSystemName: 'Paris Métro',
    centerLat: 48.8566,
    centerLng: 2.3522,
    metroStations: [
      { name: 'Bir-Hakeim (Tour Eiffel)', line: 'Line 6', lat: 48.8539, lng: 2.2893 },
      { name: 'Palais Royal - Musée du Louvre', line: 'Line 1 / Line 7', lat: 48.8624, lng: 2.3364 },
      { name: 'Cité (Notre-Dame)', line: 'Line 4', lat: 48.8550, lng: 2.3470 },
      { name: 'Anvers (Sacré-Cœur)', line: 'Line 2', lat: 48.8828, lng: 2.3444 },
      { name: 'Charles de Gaulle - Étoile', line: 'Line 1 / RER A', lat: 48.8738, lng: 2.2950 }
    ],
    places: [
      {
        name: 'Eiffel Tower & Champ de Mars Grounds',
        category: 'culture',
        isOutdoor: true,
        durationMinutes: 105,
        bestTime: 'Morning',
        description: 'Stand beneath Gustave Eiffel’s 1889 wrought-iron lattice monument and admire views over the Seine.',
        estimatedTravelTime: '🚶 10 min walk',
        weatherSuitability: 'High',
        personaSuitability: ['Explorer', 'Luxury', 'Family', 'Solo Explorer', 'Backpacker'],
        whySelectedReason: 'The universal symbol of Paris and romantic architecture.',
        lat: 48.8584,
        lng: 2.2945,
        indoorAlternative: {
          name: 'Musée d’Orsay Impressionist Galleries',
          description: 'Housed in a grand Beaux-Arts railway station featuring Monet, Van Gogh, and Degas masterpieces.',
          durationMinutes: 105,
          category: 'indoor_museum'
        }
      },
      {
        name: 'Louvre Museum & Glass Pyramid',
        category: 'culture',
        isOutdoor: false,
        durationMinutes: 150,
        bestTime: 'Afternoon',
        description: 'Discover the Mona Lisa, Venus de Milo, and Winged Victory inside the world’s largest art museum.',
        estimatedTravelTime: '🚶 8 min walk',
        weatherSuitability: 'Indoor Only',
        personaSuitability: ['Explorer', 'Luxury', 'Backpacker', 'Family', 'Solo Explorer'],
        whySelectedReason: 'Historic French royal palace hosting 38,000 works of historic art.',
        lat: 48.8606,
        lng: 2.3376
      },
      {
        name: 'Sacré-Cœur Basilica & Montmartre Artists Village',
        category: 'culture',
        isOutdoor: true,
        durationMinutes: 105,
        bestTime: 'Afternoon',
        description: 'Climb the steps of Montmartre hill to the white dome basilica and wander bohemian painter squares.',
        estimatedTravelTime: '🚗 18 min drive',
        weatherSuitability: 'High',
        personaSuitability: ['Backpacker', 'Solo Explorer', 'Explorer'],
        whySelectedReason: 'Panoramic hilltop vistas and romantic artistic neighborhood charm.',
        lat: 48.8867,
        lng: 2.3431,
        indoorAlternative: {
          name: 'Centre Pompidou Modern Art Museum',
          description: 'High-tech architectural landmark housing Europe’s largest modern art collection.',
          durationMinutes: 90,
          category: 'indoor_museum'
        }
      },
      {
        name: 'Le Marais Boulangerie & Pastry Tasting',
        category: 'food',
        isOutdoor: true,
        durationMinutes: 90,
        bestTime: 'Morning',
        description: 'Sample fresh croissants, macarons, eclairs, and artisanal cheeses through historic Marais cobble streets.',
        estimatedTravelTime: '🚶 6 min walk',
        weatherSuitability: 'Moderate',
        personaSuitability: ['Backpacker', 'Explorer', 'Luxury', 'Solo Explorer'],
        whySelectedReason: 'Authentic French patisserie and gastronomy heritage.',
        lat: 48.8575,
        lng: 2.3582
      }
    ]
  },
  tokyo: {
    cityName: 'Tokyo',
    country: 'Japan',
    hasMetro: true,
    transitSystemName: 'Tokyo Metro / JR Yamanote',
    centerLat: 35.6762,
    centerLng: 139.6503,
    metroStations: [
      { name: 'Asakusa Station', line: 'Ginza Line / Asakusa Line', lat: 35.7106, lng: 139.7967 },
      { name: 'Shibuya Station', line: 'JR Yamanote / Hanzomon Line', lat: 35.6580, lng: 139.7016 },
      { name: 'Harajuku Station', line: 'JR Yamanote Line', lat: 35.6702, lng: 139.7027 },
      { name: 'Shinjuku Station', line: 'JR Yamanote / Marunouchi Line', lat: 35.6895, lng: 139.7004 },
      { name: 'Akihabara Station', line: 'JR Yamanote / Hibiya Line', lat: 35.6983, lng: 139.7731 }
    ],
    places: [
      {
        name: 'Sensō-ji Temple & Nakamise Shopping Street',
        category: 'culture',
        isOutdoor: true,
        durationMinutes: 105,
        bestTime: 'Morning',
        description: 'Enter Tokyo’s oldest Buddhist temple through the giant Kaminarimon lantern gate and sample traditional matcha snacks.',
        estimatedTravelTime: '🚶 5 min walk',
        weatherSuitability: 'High',
        personaSuitability: ['Explorer', 'Family', 'Backpacker', 'Solo Explorer'],
        whySelectedReason: 'Historic 7th-century spiritual sanctuary representing traditional Edo culture.',
        lat: 35.7148,
        lng: 139.7967,
        indoorAlternative: {
          name: 'Tokyo National Museum (Ueno Park)',
          description: 'Japan’s oldest national museum showcasing samurai armor, kimono, and ancient Buddhist statues.',
          durationMinutes: 105,
          category: 'indoor_museum'
        }
      },
      {
        name: 'Shibuya Crossing & Hachikō Square',
        category: 'culture',
        isOutdoor: true,
        durationMinutes: 75,
        bestTime: 'Evening',
        description: 'Experience the world’s busiest pedestrian intersection illuminated by neon screens and giant billboards.',
        estimatedTravelTime: '🚶 3 min walk',
        weatherSuitability: 'High',
        personaSuitability: ['Explorer', 'Solo Explorer', 'Backpacker', 'Family'],
        whySelectedReason: 'The electrifying modern heart of Tokyo urban culture.',
        lat: 35.6595,
        lng: 139.7004,
        indoorAlternative: {
          name: 'SHIBUYA SKY Indoor Lounge & Observation Deck',
          description: 'Sky-high indoor glass lounge overlooking Shibuya crossing and Mount Fuji.',
          durationMinutes: 75,
          category: 'indoor_entertainment'
        }
      },
      {
        name: 'Meiji Jingu Shrine & Forest Paths',
        category: 'nature',
        isOutdoor: true,
        durationMinutes: 90,
        bestTime: 'Morning',
        description: 'Pass under massive wooden Torii gates into a tranquil 170-acre forest surrounding Emperor Meiji’s Shinto shrine.',
        estimatedTravelTime: '🚶 8 min walk',
        weatherSuitability: 'High',
        personaSuitability: ['Family', 'Solo Explorer', 'Explorer'],
        whySelectedReason: 'Serene spiritual forest oasis right in the center of Tokyo.',
        lat: 35.6764,
        lng: 139.6993,
        indoorAlternative: {
          name: 'teamLab Planets Digital Art Museum',
          description: 'Walk through body-immersive indoor digital art installations and water rooms.',
          durationMinutes: 90,
          category: 'indoor_entertainment'
        }
      },
      {
        name: 'Tsukiji Outer Market Fresh Sushi Tasting',
        category: 'food',
        isOutdoor: true,
        durationMinutes: 90,
        bestTime: 'Morning',
        description: 'Sample fresh sashimi, tamagoyaki egg omelets, grilled wagyu skewers, and fresh seafood street snacks.',
        estimatedTravelTime: '🚶 6 min walk',
        weatherSuitability: 'Moderate',
        personaSuitability: ['Backpacker', 'Explorer', 'Luxury', 'Solo Explorer'],
        whySelectedReason: 'Tokyo’s premiere seafood street market culinary experience.',
        lat: 35.6654,
        lng: 139.7707
      }
    ]
  },
  newyork: {
    cityName: 'New York',
    country: 'United States',
    hasMetro: true,
    transitSystemName: 'NYC Subway',
    centerLat: 40.7128,
    centerLng: -74.0060,
    metroStations: [
      { name: 'Central Park South / 59 St', line: 'N / Q / R / W', lat: 40.7663, lng: -73.9772 },
      { name: 'Times Sq - 42 St', line: '1 / 2 / 3 / N / Q / R / 7', lat: 40.7549, lng: -73.9868 },
      { name: '86 St (Metropolitan Museum)', line: '4 / 5 / 6', lat: 40.7794, lng: -73.9556 },
      { name: 'High St (Brooklyn Bridge)', line: 'A / C', lat: 40.6993, lng: -73.9904 }
    ],
    places: [
      {
        name: 'Central Park Promenade & Bethesda Terrace',
        category: 'nature',
        isOutdoor: true,
        durationMinutes: 105,
        bestTime: 'Morning',
        description: 'Walk along the Mall, admire Bethesda Fountain, and row across Central Park Lake surrounded by skyscrapers.',
        estimatedTravelTime: '🚶 8 min walk',
        weatherSuitability: 'High',
        personaSuitability: ['Family', 'Explorer', 'Solo Explorer', 'Backpacker'],
        whySelectedReason: 'The iconic 843-acre green lung in the heart of Manhattan.',
        lat: 40.7749,
        lng: -73.9708,
        indoorAlternative: {
          name: 'The Metropolitan Museum of Art (The Met)',
          description: 'Explore 5,000 years of global art, Egyptian temples, and European paintings inside America’s largest museum.',
          durationMinutes: 120,
          category: 'indoor_museum'
        }
      },
      {
        name: 'Statue of Liberty & Ellis Island Viewpoint',
        category: 'culture',
        isOutdoor: true,
        durationMinutes: 120,
        bestTime: 'Morning',
        description: 'See America’s freedom monument and the historic immigration museum in New York Harbor.',
        estimatedTravelTime: '🚗 15 min drive',
        weatherSuitability: 'High',
        personaSuitability: ['Family', 'Explorer', 'Solo Explorer'],
        whySelectedReason: 'World-famous symbol of freedom and American history.',
        lat: 40.6892,
        lng: -74.0445
      },
      {
        name: 'Times Square & Broadway Theater District',
        category: 'shopping',
        isOutdoor: true,
        durationMinutes: 75,
        bestTime: 'Evening',
        description: 'Experience the electric pulse of NYC with massive illuminated billboards and street performers.',
        estimatedTravelTime: '🚶 5 min walk',
        weatherSuitability: 'High',
        personaSuitability: ['Family', 'Backpacker', 'Explorer'],
        whySelectedReason: 'The bustling entertainment center of the world.',
        lat: 40.7580,
        lng: -73.9855
      }
    ]
  }
};

/**
 * Normalizes city query strings to lookup keys.
 * e.g. "New Delhi, India" -> "delhi", "London UK" -> "london"
 */
export function normalizeCityName(inputCity: string): string {
  const clean = inputCity.toLowerCase().trim();
  if (clean.includes('delhi')) return 'delhi';
  if (clean.includes('london')) return 'london';
  if (clean.includes('paris')) return 'paris';
  if (clean.includes('tokyo')) return 'tokyo';
  if (clean.includes('york') || clean.includes('nyc')) return 'newyork';
  return clean.replace(/[^a-z]/g, '');
}

/**
 * Returns destination dataset for a city.
 * If unsupported, generates a safe city-specific fallback place dataset anchored at the city's coordinates.
 */
export function getDestinationPlaces(
  cityName: string,
  geoLat?: number,
  geoLng?: number
): DestinationData {
  const key = normalizeCityName(cityName);
  if (DESTINATION_REGISTRY[key]) {
    return DESTINATION_REGISTRY[key];
  }

  // Safe fallback generator for unsupported cities (ensuring NO cross-city leak)
  const safeLat = geoLat || 20.0;
  const safeLng = geoLng || 0.0;
  const cleanCity = cityName.split(',')[0].trim();

  return {
    cityName: cleanCity,
    country: 'International',
    hasMetro: false,
    transitSystemName: `${cleanCity} Public Transit`,
    centerLat: safeLat,
    centerLng: safeLng,
    metroStations: [
      { name: `${cleanCity} Central Station`, lat: safeLat + 0.005, lng: safeLng + 0.005 },
      { name: `${cleanCity} City Center Stop`, lat: safeLat - 0.005, lng: safeLng - 0.005 }
    ],
    places: [
      {
        name: `${cleanCity} Historic Old Town & Heritage Walk`,
        category: 'culture',
        isOutdoor: true,
        durationMinutes: 120,
        bestTime: 'Morning',
        description: `Explore the historical center of ${cleanCity}, featuring historic architecture, local monuments, and cultural heritage points.`,
        estimatedTravelTime: '🚶 10 min walk',
        weatherSuitability: 'High',
        personaSuitability: ['Explorer', 'Backpacker', 'Family', 'Solo Explorer'],
        whySelectedReason: `Selected as the premier historical landmark in ${cleanCity}.`,
        lat: safeLat + 0.002,
        lng: safeLng + 0.002,
        indoorAlternative: {
          name: `${cleanCity} Cultural Museum`,
          description: `Explore indoor galleries showcasing the history and heritage of ${cleanCity}.`,
          durationMinutes: 120,
          category: 'indoor_museum'
        }
      },
      {
        name: `${cleanCity} Central Plaza & Local Market`,
        category: 'food',
        isOutdoor: true,
        durationMinutes: 90,
        bestTime: 'Afternoon',
        description: `Sample local culinary specialties, artisanal snacks, and fresh delicacies in ${cleanCity}'s vibrant market square.`,
        estimatedTravelTime: '🚶 8 min walk',
        weatherSuitability: 'Moderate',
        personaSuitability: ['Backpacker', 'Explorer', 'Solo Explorer'],
        whySelectedReason: `Authentic food experience reflecting local culinary traditions in ${cleanCity}.`,
        lat: safeLat - 0.003,
        lng: safeLng + 0.003,
        indoorAlternative: {
          name: `${cleanCity} Covered Food Market`,
          description: `Indoor food court featuring regional delicacies from local chefs.`,
          durationMinutes: 90,
          category: 'food'
        }
      },
      {
        name: `${cleanCity} Waterfront Park & Botanical Gardens`,
        category: 'nature',
        isOutdoor: true,
        durationMinutes: 90,
        bestTime: 'Evening',
        description: `Relaxing stroll through green pathways and scenic viewpoints across ${cleanCity}.`,
        estimatedTravelTime: '🚗 12 min drive',
        weatherSuitability: 'High',
        personaSuitability: ['Family', 'Solo Explorer', 'Luxury'],
        whySelectedReason: `Peaceful nature walk showcasing the natural landscapes of ${cleanCity}.`,
        lat: safeLat + 0.008,
        lng: safeLng - 0.004,
        indoorAlternative: {
          name: `${cleanCity} Botanical Greenhouse`,
          description: `Indoor tropical garden dome featuring exotic plants and glasshouses.`,
          durationMinutes: 90,
          category: 'indoor_museum'
        }
      }
    ]
  };
}

/**
 * Validates zero cross-city contamination.
 * Throws or removes any activity that mentions wrong-city landmarks.
 */
export function validateZeroCrossContamination(cityName: string, activities: Activity[]): Activity[] {
  const key = normalizeCityName(cityName);

  const wrongKeywords: Record<string, string[]> = {
    delhi: ['big ben', 'tower bridge', 'london eye', 'eiffel tower', 'shibuya', 'times square'],
    london: ['red fort', 'qutub minar', 'akshardham', 'chandni chowk', 'eiffel tower', 'shibuya'],
    paris: ['red fort', 'big ben', 'tower bridge', 'qutub minar', 'shibuya'],
    tokyo: ['red fort', 'big ben', 'eiffel tower', 'humayun'],
  };

  const forbidden = wrongKeywords[key] || [];
  if (forbidden.length === 0) return activities;

  return activities.filter((act) => {
    const text = `${act.name} ${act.description}`.toLowerCase();
    const isContaminated = forbidden.some((kw) => text.includes(kw));
    if (isContaminated) {
      console.warn(`[ZeroContaminationGuard] Removed cross-city activity "${act.name}" from ${cityName}`);
      return false;
    }
    return true;
  });
}
