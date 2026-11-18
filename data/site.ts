// Populate only with approved Koora content. Empty collections stay off the homepage.
export const SITE = {
  heroVideo: "",
  youtube: "",
  paymentUrl: "",
};
export const NAV = [
  ["/", "Home"],
  ["/villas", "Stays"],
  ["/estate-management", "Estate Management"],
  ["/development", "Development"],
  ["/destination", "Destination"],
  ["/journal", "Journal"],
  ["/about", "About"],
  ["/contact", "Contact"],
];
export const STATISTICS: { value: string; label: string }[] = [];
export const STORIES: {
  kind: "Guest" | "Owner";
  quote: string;
  name: string;
  property: string;
  platform: string;
  rating?: number;
}[] = [];
export const SALES: {
  name: string;
  location: string;
  image: string;
  description: string;
}[] = [];
export type Media = { videoUrl?: string; tourUrl?: string; floorPlan?: string };
export const PROJECTS: ({
  name: string;
  description: string;
  image: string;
  stage: string;
} & Media)[] = [];
export const JOURNAL: {
  slug: string;
  title: string;
  category: string;
  image: string;
  intro: string;
  paragraphs: string[];
  videoUrl?: string;
}[] = [
  {
    slug: "a-home-for-your-kind-of-stay",
    title: "A home for your kind of stay.",
    category: "Homes",
    image: "/images/stays/casa-loma-3.webp",
    intro:
      "Space to gather. Room to retreat. Start with how you want to spend your days.",
    paragraphs: [
      "A good stay starts with the right questions. Who is coming with you? Do you picture long lunches together, quiet mornings on a deck, or a pool to return to after the beach?",
      "Koora’s collection ranges from wooden studios for two to larger villas for family and friends. Look at the layout as well as the guest capacity: shared mezzanines, separate suites and access roads all shape the experience.",
      "Tell our local team what matters most. We can help you compare homes, understand the configuration and confirm arrangements for your dates.",
    ],
  },
  {
    slug: "before-you-arrive",
    title: "Before you arrive.",
    category: "Behind Koora",
    image: "/images/stays/casa-la-nina-4.webp",
    intro: "The details that help you feel at home from the beginning.",
    paragraphs: [
      "Arrival is easier when the practical details are clear. Share your arrival plans with the Koora team so we can confirm directions, check-in arrangements and the best way to reach your home.",
      "Some hillside properties require a 4×4. Ask about access before arranging transport, and let us know about children, mobility needs or anything else that will help us recommend the right home.",
      "Housekeeping and other services vary by property. We’ll discuss what is included and what can be arranged before you commit to your stay.",
    ],
  },
];
export const PILLARS = [
  [
    "Local knowledge",
    "We live and work here. Our understanding of Santa Teresa and Malpaís starts on the ground.",
  ],
  [
    "Personal service",
    "A direct conversation with people who know your home, your plans and the details that matter.",
  ],
  [
    "On-the-ground team",
    "Local coordination when a guest or a property needs attention.",
  ],
  [
    "Curated portfolio",
    "A considered collection of homes, each with its own character and sense of place.",
  ],
  [
    "Complete property care",
    "One local team connecting the everyday details of hospitality, operations and home care.",
  ],
];
export const EXPERIENCES = [
  [
    "Surf",
    "Make time for the ocean.",
    "Tell us your experience level and we can help you plan time in the water with local guidance.",
  ],
  [
    "Local food",
    "A taste of life here.",
    "From a relaxed breakfast to dinner with friends, ask our team for recommendations that suit your plans.",
  ],
  [
    "Shopping",
    "Something to take home.",
    "Discover local shops and ask us where to look for everyday essentials and pieces with a sense of place.",
  ],
  [
    "Wellness",
    "Find a slower rhythm.",
    "Make room for movement, rest and time to yourself. Speak with us about local options for your visit.",
  ],
  [
    "Adventure",
    "Take the day outside.",
    "Tell us what you love to do and we can help you explore activities and arrangements nearby.",
  ],
  [
    "Explore",
    "Leave room for discovery.",
    "Walk the coast, settle into your surroundings and ask our team what fits the season and your pace.",
  ],
];
