export interface MultiViewImage {
  title: string;
  url: string;
  caption: string;
}

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
  multiViewImages?: MultiViewImage[];
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
          architecturalImportance: 'Framed by grand octagonal towers, flame-shaped battlements, pointed Mughal arch, and white marble cupolas (chhatris).',
          whyVisit: 'Offers a breathtaking first view of the fort and leads into the historic Chhatta Chowk covered bazaar.',
          cameraPitch: -25,
          cameraHeading: 90,
          multiViewImages: [
            {
              title: 'Front Elevation & Archway View',
              url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
              caption: 'Frontal perspective showing the pointed Mughal entrance portal and red sandstone ramparts.'
            },
            {
              title: 'Arcade & White Chhatri Detail',
              url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
              caption: 'Close-up of the 7 white marble domed cupolas lining the upper parapet arcade.'
            },
            {
              title: 'Aerial Fortified Ramparts View',
              url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
              caption: 'Panoramic view over the grassy embankments and octagonal flanking towers.'
            }
          ]
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
          cameraHeading: 120,
          multiViewImages: [
            {
              title: 'Pillared Hall Elevation',
              url: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe707?auto=format&fit=crop&w=800&q=80',
              caption: 'Red sandstone pillars supporting cusped Mughal arches in the public hall.'
            },
            {
              title: 'Royal Marble Throne Canopy',
              url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
              caption: 'Carved marble throne seat with Florentine pietra dura stone inlays.'
            }
          ]
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
          cameraHeading: 45,
          multiViewImages: [
            {
              title: 'White Marble Pavilion Exterior',
              url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
              caption: 'Pure white marble facade with corner domed chhatris overlooking gardens.'
            },
            {
              title: 'Inlaid Marble Pillars & Inscriptions',
              url: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe707?auto=format&fit=crop&w=800&q=80',
              caption: 'Intricate floral pietra dura craftsmanship and golden leaf ceiling details.'
            }
          ]
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
          cameraHeading: 310,
          multiViewImages: [
            {
              title: 'Triple Marble Domes View',
              url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
              caption: 'Bulbous white marble domes and carved marble screen facade.'
            }
          ]
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
          cameraHeading: 0,
          multiViewImages: [
            {
              title: 'Vertical Elevation Shaft View',
              url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
              caption: 'Full 72.5m fluted red sandstone and marble tower tapering skyward.'
            },
            {
              title: 'Inscribed Calligraphy Band Detail',
              url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
              caption: 'Intricate Arabic calligraphy bands and muqarnas stalactite balcony carvings.'
            }
          ]
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
          cameraHeading: 270,
          multiViewImages: [
            {
              title: 'Carved Temple Pillar Colonnade',
              url: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe707?auto=format&fit=crop&w=800&q=80',
              caption: 'Ornate carved stone pillars displaying bell and lotus motifs.'
            }
          ]
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
          architecturalImportance: 'Forged from wrought iron with high phosphorus content creating a protective passive oxide layer.',
          whyVisit: 'Scientists worldwide still study its rust-resistant metallurgical composition.',
          cameraPitch: -15,
          cameraHeading: 135,
          multiViewImages: [
            {
              title: 'Gupta Iron Pillar & Capital Top',
              url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
              caption: '1,600-year-old rust-resistant iron pillar standing in the mosque courtyard.'
            }
          ]
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
          cameraHeading: 60,
          multiViewImages: [
            {
              title: 'Central Dome & Facade Elevation',
              url: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe707?auto=format&fit=crop&w=800&q=80',
              caption: 'Symmetrical red sandstone octagonal structure topped by double marble dome.'
            }
          ]
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
          cameraHeading: 180,
          multiViewImages: [
            {
              title: 'Water Channel Paradise Garden View',
              url: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe707?auto=format&fit=crop&w=800&q=80',
              caption: 'Persian Charbagh geometry with water channels and flower quadrants.'
            }
          ]
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
          cameraHeading: 120,
          multiViewImages: [
            {
              title: '148 Elephant Relief Plinth View',
              url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
              caption: 'Solid pink sandstone plinth with 148 handcrafted full-sized elephant carvings.'
            }
          ]
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
          cameraHeading: 270,
          multiViewImages: [
            {
              title: 'Pink Sandstone Mandovar Wall Detail',
              url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
              caption: '200 carved stone figures of sages and spiritual teachers lining the temple wall.'
            }
          ]
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
          cameraHeading: 45,
          multiViewImages: [
            {
              title: 'Thames Elevation Twin Towers',
              url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
              caption: 'Gothic stone towers and suspension spans over River Thames.'
            }
          ]
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
          cameraHeading: 0,
          multiViewImages: [
            {
              title: 'High-Level Glass Floor Perspective',
              url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
              caption: 'Transparent glass walkway looking down on bridge traffic 42 meters below.'
            }
          ]
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
          cameraHeading: 90,
          multiViewImages: [
            {
              title: 'Tessellated Glass Roof Canopy',
              url: 'https://images.unsplash.com/photo-1565060169194-1a65d5ef07ee?auto=format&fit=crop&w=800&q=80',
              caption: '3,312 glass panes forming Europe’s largest covered square.'
            }
          ]
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
          cameraHeading: 180,
          multiViewImages: [
            {
              title: 'Rosetta Stone Display Stele',
              url: 'https://images.unsplash.com/photo-1565060169194-1a65d5ef07ee?auto=format&fit=crop&w=800&q=80',
              caption: 'Ancient Egyptian granodiorite stone inscribed with Greek and Demotic scripts.'
            }
          ]
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
          cameraHeading: 30,
          multiViewImages: [
            {
              title: 'Champ de Mars Lattice Tower Elevation',
              url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
              caption: '330-meter iron lattice structure viewed from Champ de Mars.'
            }
          ]
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
          cameraHeading: 180,
          multiViewImages: [
            {
              title: 'Parisian Skyline from Summit',
              url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
              caption: '360-degree panoramic deck looking towards River Seine and Arc de Triomphe.'
            }
          ]
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
          cameraHeading: 220,
          multiViewImages: [
            {
              title: 'Cour Napoléon Glass Pyramid Entrance',
              url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
              caption: 'Modern glass pyramid in front of classical French Renaissance palace facade.'
            }
          ]
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
          cameraHeading: 90,
          multiViewImages: [
            {
              title: 'Salle des États Gallery',
              url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
              caption: 'Leonardo da Vinci’s Mona Lisa portrait inside bulletproof display casing.'
            }
          ]
        }
      ]
    }
  ]
};

export function getMonumentsForCity(city: string): Monument[] {
  const normalized = (city || 'delhi').toLowerCase().trim();
  for (const key of Object.keys(MONUMENTS_REGISTRY)) {
    if (normalized.includes(key)) {
      return MONUMENTS_REGISTRY[key];
    }
  }
  return MONUMENTS_REGISTRY.delhi;
}

export function getMonumentById(monumentId: string): { monument: Monument; cityKey: string } | null {
  const normId = (monumentId || '').toLowerCase().trim();
  for (const [cityKey, monuments] of Object.entries(MONUMENTS_REGISTRY)) {
    const match = monuments.find((m) => m.id === normId || m.name.toLowerCase().includes(normId));
    if (match) return { monument: match, cityKey };
  }
  return null;
}
