// Mock data for the DearMemory prototype. No backend; everything lives here.

export const PHOTOS = {
  weddingHero: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80&auto=format&fit=crop",
  weddingCouple: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&q=80&auto=format&fit=crop",
  weddingDetails: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&q=80&auto=format&fit=crop",
  weddingFlowers: "https://images.unsplash.com/photo-1525772764200-be829a350797?w=900&q=80&auto=format&fit=crop",
  weddingDance: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&q=80&auto=format&fit=crop",
  graduation: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80&auto=format&fit=crop",
  graduationGroup: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=900&q=80&auto=format&fit=crop",
  concert: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80&auto=format&fit=crop",
  concertCrowd: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=80&auto=format&fit=crop",
  birthday: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=80&auto=format&fit=crop",
  corporate: "https://images.unsplash.com/photo-1511795409834-432f7b1728f2?w=900&q=80&auto=format&fit=crop",
  sports: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80&auto=format&fit=crop",
  portfolio1: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=80&auto=format&fit=crop",
  portfolio2: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&q=80&auto=format&fit=crop",
  portfolio3: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80&auto=format&fit=crop",
  team1: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80&auto=format&fit=crop",
  team2: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&auto=format&fit=crop",
  team3: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&auto=format&fit=crop",
};

export type EventType = "Wedding" | "Graduation" | "Concert" | "Corporate" | "Birthday" | "Sports";

export const EVENT_TYPES: { type: EventType; emoji: string; color: string; description: string }[] = [
  { type: "Wedding", emoji: "💍", color: "bg-emerald-light", description: "Forever moments, beautifully kept." },
  { type: "Graduation", emoji: "🎓", color: "bg-sky", description: "A milestone worth celebrating." },
  { type: "Concert", emoji: "🎤", color: "bg-lavender", description: "Energy captured in every frame." },
  { type: "Corporate", emoji: "🏢", color: "bg-cream", description: "Brand stories, told beautifully." },
  { type: "Birthday", emoji: "🎂", color: "bg-blush", description: "Joy worth remembering." },
  { type: "Sports", emoji: "🏆", color: "bg-emerald-light", description: "Victory in motion." },
];

export interface MockEvent {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  type: EventType;
  date: string;
  cover: string;
  views: number;
  visitors: number;
  photos: number;
  status: "Live" | "Draft" | "Scheduled";
  template: string;
}

export const EVENTS: MockEvent[] = [
  { id: "e1", slug: "the-laurent-wedding", title: "The Laurent Wedding", subtitle: "Sophie & Étienne", type: "Wedding", date: "June 14, 2024", cover: PHOTOS.weddingHero, views: 12480, visitors: 2143, photos: 642, status: "Live", template: "Timeless Romance" },
  { id: "e2", slug: "class-of-24", title: "Class of '24 — Westwood", subtitle: "Spring Commencement", type: "Graduation", date: "May 22, 2024", cover: PHOTOS.graduation, views: 8230, visitors: 1820, photos: 1204, status: "Live", template: "Golden Memories" },
  { id: "e3", slug: "midnight-bloom-fest", title: "Midnight Bloom Festival", subtitle: "Two nights, one city", type: "Concert", date: "August 03, 2024", cover: PHOTOS.concert, views: 24100, visitors: 6420, photos: 2810, status: "Live", template: "Festival Vibes" },
  { id: "e4", slug: "north-and-co-summit", title: "North & Co. Annual Summit", subtitle: "Brand keynote 2024", type: "Corporate", date: "October 11, 2024", cover: PHOTOS.corporate, views: 1620, visitors: 380, photos: 248, status: "Draft", template: "Modern Elegance" },
  { id: "e5", slug: "olive-turns-five", title: "Olive Turns Five", subtitle: "A backyard celebration", type: "Birthday", date: "April 06, 2024", cover: PHOTOS.birthday, views: 940, visitors: 168, photos: 134, status: "Live", template: "Grand Celebration" },
  { id: "e6", slug: "harbor-marathon", title: "Harbor Marathon", subtitle: "Finishers gallery", type: "Sports", date: "Sept 09, 2024", cover: PHOTOS.sports, views: 4820, visitors: 2104, photos: 3201, status: "Scheduled", template: "Legacy Collection" },
];

export interface Template {
  id: string;
  name: string;
  category: string;
  cover: string;
  accent: string;
  description: string;
}

export const TEMPLATES: Template[] = [
  { id: "t1", name: "Timeless Romance", category: "Weddings", cover: PHOTOS.weddingCouple, accent: "bg-emerald-light", description: "Editorial layouts, soft serif type, made for forever." },
  { id: "t2", name: "Golden Memories", category: "Graduations", cover: PHOTOS.graduationGroup, accent: "bg-sky", description: "Bright, hopeful, perfect for milestones." },
  { id: "t3", name: "Forever Begins", category: "Weddings", cover: PHOTOS.weddingDetails, accent: "bg-blush", description: "A modern romance with cinematic flow." },
  { id: "t4", name: "Grand Celebration", category: "Birthdays", cover: PHOTOS.birthday, accent: "bg-lavender", description: "Playful, warm, ready to party." },
  { id: "t5", name: "Modern Elegance", category: "Corporate", cover: PHOTOS.corporate, accent: "bg-cream", description: "Clean, premium, brand-ready." },
  { id: "t6", name: "Festival Vibes", category: "Concerts", cover: PHOTOS.concertCrowd, accent: "bg-lavender", description: "High-energy galleries for live music." },
  { id: "t7", name: "Legacy Collection", category: "Sports", cover: PHOTOS.sports, accent: "bg-emerald-light", description: "Stories of triumph, told beautifully." },
  { id: "t8", name: "Garden Soirée", category: "Weddings", cover: PHOTOS.weddingFlowers, accent: "bg-emerald-light", description: "Botanical accents and airy spacing." },
];

export interface Lead {
  id: string;
  name: string;
  event: string;
  source: string;
  status: "New" | "Contacted" | "Quoted" | "Booked" | "Lost";
  budget: string;
  date: string;
}

export const LEADS: Lead[] = [
  { id: "l1", name: "Amara & Ben", event: "Wedding · Sept 2025", source: "Instagram", status: "New", budget: "$8–12k", date: "2h ago" },
  { id: "l2", name: "Westwood High", event: "Graduation 2025", source: "Referral", status: "Quoted", budget: "$4k", date: "Yesterday" },
  { id: "l3", name: "Halcyon Records", event: "Tour Photography", source: "Portfolio", status: "Contacted", budget: "Custom", date: "3 days ago" },
  { id: "l4", name: "Maya & Theo", event: "Engagement Shoot", source: "Google", status: "Booked", budget: "$1.2k", date: "Last week" },
  { id: "l5", name: "Forge Industries", event: "Corporate Gala", source: "LinkedIn", status: "New", budget: "$6k", date: "Today" },
  { id: "l6", name: "Olive's Family", event: "Birthday party", source: "Word of mouth", status: "Booked", budget: "$800", date: "Last week" },
];

export const ACTIVITY = [
  { id: "a1", user: "Sophie L.", action: "left a guestbook note on", target: "The Laurent Wedding", time: "12m" },
  { id: "a2", user: "You", action: "published", target: "Midnight Bloom Festival", time: "2h" },
  { id: "a3", user: "Halcyon Records", action: "requested a quote for", target: "Tour Photography", time: "4h" },
  { id: "a4", user: "Class of '24", action: "downloaded", target: "642 photos", time: "Yesterday" },
  { id: "a5", user: "Olive's Family", action: "favorited", target: "32 photos", time: "Yesterday" },
];

export const ANALYTICS_TRAFFIC = [
  { day: "Mon", views: 1820, visitors: 420 },
  { day: "Tue", views: 2410, visitors: 510 },
  { day: "Wed", views: 3120, visitors: 690 },
  { day: "Thu", views: 2810, visitors: 612 },
  { day: "Fri", views: 4210, visitors: 920 },
  { day: "Sat", views: 5640, visitors: 1240 },
  { day: "Sun", views: 4820, visitors: 1080 },
];

export const STUDIO = {
  name: "Goldenhour Studio",
  slug: "goldenhour",
  tagline: "Wedding & event photography rooted in warmth.",
  about: "We are a small studio in Lisbon documenting weddings, intimate gatherings, and brand stories across Europe. Our work is honest, warm, and made to be looked back on for decades.",
  founded: 2016,
  stats: [
    { value: "127", label: "Events completed" },
    { value: "48,200", label: "Photos delivered" },
    { value: "4.9", label: "Client rating" },
    { value: "2.3M", label: "Gallery views" },
    { value: "8", label: "Years of work" },
  ],
  packages: [
    { name: "Half-day Coverage", price: "from €1,800", description: "Up to 5 hours, 250 edited photos, online gallery." },
    { name: "Full Day", price: "from €3,200", description: "10 hours, 600+ photos, custom event website." },
    { name: "Heirloom", price: "from €5,400", description: "Two photographers, printed album, premium DearMemory site." },
  ],
  reviews: [
    { name: "Sophie & Étienne", text: "They captured the day with such care. We open our DearMemory site every Sunday morning.", rating: 5 },
    { name: "Halcyon Records", text: "Best festival delivery we've ever had. 10,000 photos, zero friction, the band loved the gallery.", rating: 5 },
    { name: "Westwood High", text: "Parents kept calling to thank us. The site made every family feel seen.", rating: 5 },
  ],
};

export const TESTIMONIALS = [
  { studio: "Goldenhour Studio", city: "Lisbon, PT", text: "DearMemory turned delivery from a chore into part of the experience. Bookings up 38% this year.", name: "Inês M." },
  { studio: "Noise & Light Studio", city: "Berlin, DE", text: "10,000 festival photos delivered without a single support ticket. Game changer.", name: "Jonas R." },
  { studio: "Avery & Co.", city: "Brooklyn, NY", text: "Our brides finally have a home for their photos that feels as beautiful as the day was.", name: "Avery T." },
];
