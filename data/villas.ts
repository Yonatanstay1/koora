export type City = "santa-teresa" | "malpais";

export interface Villa {
  videoUrl?: string;
  tourUrl?: string;
  floorPlan?: string;
  bookingUrl?: string;
  slug: string;
  name: string;
  city: City;
  cityLabel: string;
  address: string;
  tagline: string;
  description: string;
  beds: number;
  baths: number;
  sleeps: number;
  pricePerNight: number;
  amenities: string[];
  highlights: string[];
  bestFor: string[];
  images: string[];
  featured: boolean;
  latitude: number;
  longitude: number;
}

const ALL_VILLAS: Villa[] = [
  {
    slug: "pacific-surfshack",
    name: "Pacific SurfShack",
    city: "santa-teresa",
    cityLabel: "Santa Teresa",
    address: "Santa Teresa, Puntarenas, Costa Rica",
    tagline: "Ocean views · Private pool · Groups",
    description:
      "Pacific SurfShack is a private villa in the jungle hills above Costa Rica’s Pacific coast, with ocean views from the deck and its own pool. It is 8 minutes by car or ATV from the centre of Santa Teresa, its beachfront bars and restaurants, so you can surf, ride or eat out by day and come back to a quiet retreat at night.",
    beds: 3,
    baths: 4,
    sleeps: 5,
    pricePerNight: 287,
    amenities: ["Swimming Pool", "Air Conditioning", "Wi-Fi", "Laundry", "Free Parking"],
    highlights: ["Ocean views", "Private pool", "Air conditioning", "Free parking"],
    bestFor: ["Families", "Small groups", "Surf trips"],
    images: [
      "/images/stays/pacific-surfshack-1.webp",
      "/images/stays/pacific-surfshack-2.webp",
      "/images/stays/pacific-surfshack-3.webp",
      "/images/stays/pacific-surfshack-4.webp",
      "/images/stays/pacific-surfshack-5.webp",
      "/images/stays/pacific-surfshack-6.webp",
    ],
    featured: true,
    latitude: 9.6148,
    longitude: -85.1332,
  },
  {
    slug: "casa-ficus",
    name: "Casa Ficus",
    city: "santa-teresa",
    cityLabel: "Santa Teresa",
    address: "santa teresa costa rica",
    tagline: "Couples · Beach lifestyle · Walkable stays",
    description:
      "A light-filled home tucked away just off the main road in Santa Teresa. Two private bedrooms and an open mezzanine room accommodate up to six guests, with a kitchen and terrace overlooking the pool. The mezzanine opens onto the living space, making this a good choice for guests comfortable sharing a home.",
    beds: 3,
    baths: 2,
    sleeps: 6,
    pricePerNight: 380,
    amenities: [
      "Air Conditioning",
      "Laundry",
      "Swimming Pool",
      "Wi-Fi",
      "Free Parking",
    ],
    highlights: [
      "Heart of Santa Teresa",
      "Air conditioning",
      "Laundry",
      "Free parking",
    ],
    bestFor: ["Couples", "Beach lifestyle", "Walkable stays"],
    images: [
      "/images/stays/casa-ficus-1.webp",
      "/images/stays/casa-ficus-2.webp",
      "/images/stays/casa-ficus-3.webp",
      "/images/stays/casa-ficus-4.webp",
      "/images/stays/casa-ficus-5.webp",
      "/images/stays/casa-ficus-6.webp",
    ],
    featured: true,
    latitude: 9.648,
    longitude: -85.054,
  },
  {
    slug: "casa-la-nina",
    name: "Casa La Niña",
    city: "santa-teresa",
    cityLabel: "Santa Teresa",
    address:
      "Santa Teresa, Cóbano, Cantón Puntarenas, Puntarenas Province, 60111, Costa Rica",
    tagline: "Small families · Ocean views · Beach trips",
    description:
      "An ocean-view hideaway with a private pool and a terrace for sunset. Two bedrooms, each with an ensuite bathroom, make space for four guests. Prepare meals in the kitchen or dine outside among the trees. A 4×4 or quad is required to access the house.",
    beds: 2,
    baths: 2,
    sleeps: 4,
    pricePerNight: 420,
    amenities: [
      "Air Conditioning",
      "Barbecue Area",
      "Laundry",
      "Swimming Pool",
      "Wi-Fi",
      "Free Parking",
      "Security",
    ],
    highlights: ["Ocean view", "Private pool", "BBQ area", "Security"],
    bestFor: ["Small families", "Ocean views", "Beach trips"],
    images: [
      "/images/stays/casa-la-nina-3.webp",
      "/images/stays/casa-la-nina-1.webp",
      "/images/stays/casa-la-nina-4.webp",
      "/images/stays/casa-la-nina-2.webp",
      "/images/stays/casa-la-nina-5.webp",
      "/images/stays/casa-la-nina-6.webp",
    ],
    featured: true,
    latitude: 9.648,
    longitude: -85.054,
  },
  {
    slug: "casa-la-onda-ultra-suite-casita-la-onda",
    name: "Casa La Onda + Ultra Suite + Casita La Onda",
    city: "santa-teresa",
    cityLabel: "Santa Teresa",
    address:
      "Calle La Cala, Santa Teresa, Cóbano, Puntarenas, 60111, Costa Rica",
    tagline: "Groups · Ocean-view retreats · Surf trips",
    description:
      "Bring everyone together at Casa La Onda. This configuration combines the main villa, Ultra Suite and separate Casita for up to ten guests. Share the infinity pool, outdoor dining and ocean views, with room to retreat to your own space. Ask the team to confirm the exact configuration for your group.",
    beds: 5,
    baths: 5.5,
    sleeps: 10,
    pricePerNight: 1775,
    amenities: [
      "Air Conditioning",
      "Barbecue Area",
      "Laundry",
      "Swimming Pool",
      "Wi-Fi",
      "Free Parking",
      "Security",
    ],
    highlights: [
      "Ocean and jungle views",
      "Modern kitchen",
      "Hillside terrace",
      "Wi-Fi",
    ],
    bestFor: ["Groups", "Ocean-view retreats", "Surf trips"],
    images: [
      "/images/stays/casa-la-onda-ultra-suite-casita-la-onda-2.webp",
      "/images/stays/casa-la-onda-ultra-suite-casita-la-onda-6.webp",
      "/images/stays/casa-la-onda-ultra-suite-casita-la-onda-5.webp",
      "/images/stays/casa-la-onda-ultra-suite-casita-la-onda-3.webp",
      "/images/stays/casa-la-onda-ultra-suite-casita-la-onda-1.webp",
      "/images/stays/casa-la-onda-ultra-suite-casita-la-onda-4.webp",
    ],
    featured: true,
    latitude: 9.642,
    longitude: -85.058,
  },
  {
    slug: "casa-la-onda-ultra-suite",
    name: "Casa La Onda + Ultra Suite",
    city: "santa-teresa",
    cityLabel: "Santa Teresa",
    address:
      "Calle La Cala, Santa Teresa, Cóbano, Puntarenas, 60111, Costa Rica",
    tagline: "Families · Groups · Long stays",
    description:
      "The main Casa La Onda villa and its elevated Ultra Suite offer room for up to eight guests. A Balinese-inspired living space opens toward an infinity pool, with ocean and jungle views. The suite adds its own kitchen and living area. Ask the team about the bedroom layout for your stay.",
    beds: 4,
    baths: 5,
    sleeps: 8,
    pricePerNight: 1300,
    amenities: [
      "Air Conditioning",
      "Barbecue Area",
      "Laundry",
      "Swimming Pool",
      "Wi-Fi",
      "Free Parking",
      "Security",
    ],
    highlights: [
      "Complete La Onda collection",
      "Ocean view",
      "Modern kitchen",
      "Hillside terrace",
    ],
    bestFor: ["Families", "Groups", "Long stays"],
    images: [
      "/images/stays/casa-la-onda-ultra-suite-6.webp",
      "/images/stays/casa-la-onda-ultra-suite-2.webp",
      "/images/stays/casa-la-onda-ultra-suite-5.webp",
      "/images/stays/casa-la-onda-ultra-suite-3.webp",
      "/images/stays/casa-la-onda-ultra-suite-1.webp",
      "/images/stays/casa-la-onda-ultra-suite-4.webp",
    ],
    featured: true,
    latitude: 9.642,
    longitude: -85.058,
  },
  {
    slug: "casa-loma",
    name: "Casa Loma",
    city: "santa-teresa",
    cityLabel: "Santa Teresa",
    address: "santa teresa",
    tagline: "Luxury travelers · Families · Private groups",
    description:
      "A spacious retreat in a private jungle community, with ocean views and an infinity pool. Teak furnishings, open living spaces and terraces bring the outdoors into everyday life. The published listing accommodates up to thirteen guests; the team will confirm the bedroom configuration and services for your group.",
    beds: 6,
    baths: 7,
    sleeps: 13,
    pricePerNight: 1000,
    amenities: [
      "Air Conditioning",
      "Barbecue Area",
      "Laundry",
      "Swimming Pool",
      "Wi-Fi",
      "Free Parking",
    ],
    highlights: [
      "Private community",
      "Approx. 5,000 sq ft",
      "Ocean view",
      "Indoor-outdoor living",
    ],
    bestFor: ["Luxury travelers", "Families", "Private groups"],
    images: [
      "/images/stays/casa-loma-3.webp",
      "/images/stays/casa-loma-1.webp",
      "/images/stays/casa-loma-4.webp",
      "/images/stays/casa-loma-2.webp",
      "/images/stays/casa-loma-5.webp",
      "/images/stays/casa-loma-6.webp",
    ],
    featured: false,
    latitude: 9.645,
    longitude: -85.056,
  },
  {
    slug: "la-kasbah-guest-house",
    name: "La Kasbah Guest house",
    city: "santa-teresa",
    cityLabel: "Santa Teresa",
    address: "las delicias shortcut",
    tagline: "Couples · Budget stays · Quiet escapes",
    description:
      "A two-bedroom guest house in the Santa Teresa area, with space for up to four guests. Explore the gallery, then tell us your dates and what matters most for your stay. Our team can confirm the layout, access and available services.",
    beds: 2,
    baths: 2,
    sleeps: 4,
    pricePerNight: 220,
    amenities: ["Air Conditioning", "Laundry", "Wi-Fi", "Free Parking"],
    highlights: [
      "Private guest house",
      "Quiet location",
      "Easy beach access",
      "Wi-Fi",
    ],
    bestFor: ["Couples", "Small groups", "Quiet escapes"],
    images: [
      "/images/stays/la-kasbah-guest-house-1.webp",
      "/images/stays/la-kasbah-guest-house-2.webp",
      "/images/stays/la-kasbah-guest-house-3.webp",
      "/images/stays/la-kasbah-guest-house-4.webp",
      "/images/stays/la-kasbah-guest-house-5.webp",
      "/images/stays/la-kasbah-guest-house-6.webp",
    ],
    featured: false,
    latitude: 9.639,
    longitude: -85.06,
  },
  {
    slug: "santa-teresa-tree-house-1",
    name: "Jungle Treehouse 1",
    city: "santa-teresa",
    cityLabel: "Santa Teresa",
    address: "C. La Cala",
    tagline: "Nature lovers · Couples · Remote workers",
    description:
      "A wooden studio for two, surrounded by jungle. A small kitchen, sitting area and private bathroom make it easy to settle in. Spend a quiet morning on the wood deck or head out toward the beach. Ask the team about an extra mattress if you are travelling with a third guest.",
    beds: 1,
    baths: 1,
    sleeps: 2,
    pricePerNight: 120,
    amenities: ["Air Conditioning", "Wi-Fi", "Free Parking", "Security"],
    highlights: [
      "Treehouse design",
      "Jungle setting",
      "Modern studio layout",
      "Wi-Fi",
    ],
    bestFor: ["Nature lovers", "Couples", "Remote workers"],
    images: [
      "/images/stays/santa-teresa-tree-house-1-1.webp",
      "/images/stays/santa-teresa-tree-house-1-2.webp",
      "/images/stays/santa-teresa-tree-house-1-3.webp",
      "/images/stays/santa-teresa-tree-house-1-4.webp",
      "/images/stays/santa-teresa-tree-house-1-5.webp",
      "/images/stays/santa-teresa-tree-house-1-6.webp",
    ],
    featured: false,
    latitude: 9.642,
    longitude: -85.058,
  },
  {
    slug: "santa-teresa-tree-house-4",
    name: "Santa Teresa Tree House #4",
    city: "santa-teresa",
    cityLabel: "Santa Teresa",
    address: "C. La Cala",
    tagline: "Nature lovers · Small groups · Digital nomads",
    description:
      "A treehouse-inspired wooden studio for two, tucked among the trees. Enjoy the forest from the wood deck, then head out to explore Santa Teresa. Ask the team about hot-tub access and arrangements for an additional guest.",
    beds: 1,
    baths: 1,
    sleeps: 2,
    pricePerNight: 120,
    amenities: ["Air Conditioning", "Wi-Fi", "Free Parking", "Security"],
    highlights: [
      "Treehouse design",
      "Jungle setting",
      "Modern cabin layout",
      "Wi-Fi",
    ],
    bestFor: ["Nature lovers", "Small groups", "Digital nomads"],
    images: [
      "/images/stays/santa-teresa-tree-house-4-1.webp",
      "/images/stays/santa-teresa-tree-house-4-2.webp",
      "/images/stays/santa-teresa-tree-house-4-3.webp",
      "/images/stays/santa-teresa-tree-house-4-4.webp",
      "/images/stays/santa-teresa-tree-house-4-5.webp",
      "/images/stays/santa-teresa-tree-house-4-6.webp",
    ],
    featured: false,
    latitude: 9.642,
    longitude: -85.058,
  },
  {
    slug: "santa-teresa-tree-houses-2",
    name: "Jungle Treehouse 2",
    city: "santa-teresa",
    cityLabel: "Santa Teresa",
    address: "C. La Cala",
    tagline: "Nature lovers · Couples · Quiet retreats",
    description:
      "A wooden studio for two in a small collection of jungle cabins. The treehouse-inspired setting offers a quiet place to slow down between days exploring Santa Teresa. Contact the team for the details of this studio and your preferred dates.",
    beds: 1,
    baths: 1,
    sleeps: 2,
    pricePerNight: 120,
    amenities: ["Air Conditioning", "Wi-Fi", "Free Parking", "Security"],
    highlights: [
      "Treehouse design",
      "Jungle setting",
      "Modern cabin layout",
      "Wi-Fi",
    ],
    bestFor: ["Nature lovers", "Couples", "Quiet retreats"],
    images: [
      "/images/stays/santa-teresa-tree-houses-2-1.webp",
      "/images/stays/santa-teresa-tree-houses-2-2.webp",
      "/images/stays/santa-teresa-tree-houses-2-3.webp",
      "/images/stays/santa-teresa-tree-houses-2-4.webp",
      "/images/stays/santa-teresa-tree-houses-2-5.webp",
      "/images/stays/santa-teresa-tree-houses-2-6.webp",
    ],
    featured: false,
    latitude: 9.642,
    longitude: -85.058,
  },
];

export const CITIES = [
  {
    slug: "santa-teresa",
    label: "Santa Teresa",
    blurb:
      "A jungle-backed beach town with year-round waves, great restaurants, and a relaxed Pacific-coast scene.",
    image:
      "https://koorarentals.com/wp-content/uploads/2024/03/DJI_0868_websize.jpg",
  },
  {
    slug: "malpais",
    label: "Malpaís",
    blurb:
      "Rocky coves, seductive swells, and quiet coastline stretching toward Cabo Blanco Nature Reserve.",
    image: "https://koorarentals.com/wp-content/uploads/2025/08/DSC09432.jpg",
  },
];

// The website shows exactly the houses that are in Koora's Beds24 account.
// Houses not in Beds24 are hidden (not deleted) so they can come back later.
const HIDDEN = new Set([
  "casa-la-nina",
  "casa-la-onda-ultra-suite",
  "casa-la-onda-ultra-suite-casita-la-onda",
  "casa-loma",
  "la-kasbah-guest-house",
  "santa-teresa-tree-house-4",
]);
export const VILLAS: Villa[] = ALL_VILLAS.filter((v) => !HIDDEN.has(v.slug));

export const CONTACT = {
  phone1: "+506 8512 5020",
  phone2: "+506 8494 5273",
  whatsapp: "+50685125020",
  email: "info@koorarentals.com",
  checkIn: "12:00 PM",
  checkOut: "10:00 AM",
  instagram: "https://instagram.com/koorarentals",
  facebook: "https://facebook.com/koorarentals",
};

export function getVilla(slug: string): Villa | undefined {
  return VILLAS.find((v) => v.slug === slug);
}
export function villasByCity(city: City): Villa[] {
  return VILLAS.filter((v) => v.city === city);
}
