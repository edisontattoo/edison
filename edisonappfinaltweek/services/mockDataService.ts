

import { Artist, StudioLocation, Service } from '../types';

export const mockArtists: Artist[] = [
  {
    id: '1',
    name: 'Studio Artist',
    specialties: ['Black and Grey Realism', 'Fine Line Tattoos', 'Custom Piercings'],
    bio: 'As the founder and lead artist, Edison combines profound technical skill with a unique artistic vision. He excels in creating breathtakingly realistic black and grey tattoos and offers expert piercing services.',
    portfolioImages: [
      'https://images.unsplash.com/photo-1594194451913-265141fd2f99?q=80&w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1541893361138-2fca73479a49?q=80&w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1616183988517-57c6b412e84a?q=80&w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1620358229314-c8d08595563a?q=80&w=600&h=400&fit=crop',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=400&fit=crop',
  },
  {
    id: '2',
    name: 'Virginia',
    specialties: ['American Traditional', 'Color Work', 'Cover-ups'],
    bio: "Virginia brings classic tattoo art into the modern era with her bold lines and vibrant color palettes. She has a talent for transforming old ink into new masterpieces with creative cover-up designs.",
    portfolioImages: [
      'https://images.unsplash.com/photo-1579261823907-99a378d3878b?q=80&w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1516222543178-8d48443e498c?q=80&w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1558511465-1b2c4e8f7d14?q=80&w=600&h=400&fit=crop',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'SHAR',
    specialties: ['Exotic Piercings', 'Curated Ear Projects', 'Dermal Anchors'],
    bio: 'SHAR is a master piercer who views the body as a canvas for adornment. They specialize in complex and exotic piercings, curated ear styling, and precision dermal work.',
    portfolioImages: [ 
      'https://images.unsplash.com/photo-1610495814144-cb1d39486835?q=80&w=600&h=400&fit=crop&grayscale',
      'https://images.unsplash.com/photo-1599395254890-a35c75ed571a?q=80&w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1610495804253-14902a76f296?q=80&w=600&h=400&fit=crop',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=400&h=400&fit=crop',
  },
    {
    id: '4',
    name: 'Fernando',
    specialties: ['Classic Piercings', 'Septum & Nostril', 'Jewelry Styling'],
    bio: 'With a gentle hand and an eye for aesthetics, Fernando ensures a comfortable and clean piercing experience. He specializes in classic placements and helping clients choose the perfect jewelry.',
    portfolioImages: [ 
      'https://images.unsplash.com/photo-1556911796-9c4459146231?q=80&w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1509307687922-a7b2ce8f309a?q=80&w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1628191010360-1a22546a9a3a?q=80&w=600&h=400&fit=crop&grayscale',
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&fit=crop',
  },
];

export const mockLocations: StudioLocation[] = [
  {
    id: 'loc1',
    name: 'Your Studio - Location 1',
    address: '6100 O St, Suite 240, Lincoln, NE 68505',
    phone: '555-1234',
    operatingHours: 'Mon-Sat: 11am - 9pm; Sun: 12pm - 6pm',
    bannerImageUrl: 'https://images.unsplash.com/photo-1575722280049-519808a3e74c?q=80&w=1200&h=400&fit=crop',
    artists: ['1', '2', '3', '4'], // All artists now at the single location
    mapEmbedUrl: `https://maps.google.com/maps?q=6100%20O%20St%2C%20Suite%20240%2C%20Lincoln%2C%20NE%2068505&t=&z=15&ie=UTF8&iwloc=&output=embed`
  }
];

export const mockServices: Service[] = [
  // Tattoos
  { id: 'tattoo_consultation', name: 'Tattoo Consultation', type: 'Tattoo', estimatedDuration: 30, description: 'Discuss your tattoo idea with an artist, plan design, and get a quote.' },
  { id: 'tattoo_small', name: 'Small Tattoo (under 2")', type: 'Tattoo', estimatedDuration: 60, description: 'Ideal for simple designs, script, or symbols.' },
  { id: 'tattoo_medium', name: 'Medium Tattoo (2"-5")', type: 'Tattoo', estimatedDuration: 120, description: 'Suitable for more detailed pieces or larger simple designs.' },
  { id: 'tattoo_large', name: 'Large Tattoo (5"+)', type: 'Tattoo', estimatedDuration: 240, description: 'For complex, large-scale projects.' },
  
  // Piercings
  { id: 'piercing_earlobe', name: 'Earlobe Piercing (Single/Pair)', type: 'Piercing', estimatedDuration: 30, description: 'Standard lobe piercing.' },
  { id: 'piercing_helix', name: 'Helix Piercing', type: 'Piercing', estimatedDuration: 30, description: 'Piercing on the outer cartilage rim of the ear.' },
  { id: 'piercing_tragus', name: 'Tragus Piercing', type: 'Piercing', estimatedDuration: 30, description: 'Piercing on the small cartilage flap in front of the ear canal.' },
  { id: 'piercing_conch', name: 'Conch Piercing', type: 'Piercing', estimatedDuration: 30, description: 'Piercing in the inner cup of the ear.' },
  { id: 'piercing_rook', name: 'Rook Piercing', type: 'Piercing', estimatedDuration: 30, description: 'Piercing of the antihelix fold of the ear.' },
  { id: 'piercing_daith', name: 'Daith Piercing', type: 'Piercing', estimatedDuration: 30, description: 'Piercing through the innermost cartilage fold of the ear.' },
  { id: 'piercing_industrial', name: 'Industrial Piercing', type: 'Piercing', estimatedDuration: 45, description: 'Two piercings connected by a single barbell.' },
  { id: 'piercing_nostril', name: 'Nostril Piercing', type: 'Piercing', estimatedDuration: 30, description: 'Piercing on the side of the nostril.' },
  { id: 'piercing_septum', name: 'Septum Piercing', type: 'Piercing', estimatedDuration: 30, description: 'Piercing through the tissue in the middle of the nose.' },
  { id: 'piercing_eyebrow', name: 'Eyebrow Piercing', type: 'Piercing', estimatedDuration: 30, description: 'Vertical or horizontal piercing through the eyebrow.' },
  { id: 'piercing_lip', name: 'Lip Piercing (Labret, Monroe, etc.)', type: 'Piercing', estimatedDuration: 30, description: 'Various placements around the lips.' },
  { id: 'piercing_tongue', name: 'Tongue Piercing', type: 'Piercing', estimatedDuration: 30, description: 'Classic piercing through the center of the tongue.' },
  { id: 'piercing_navel', name: 'Navel (Belly Button) Piercing', type: 'Piercing', estimatedDuration: 30, description: 'Piercing in or around the navel.' },
  { id: 'piercing_nipple', name: 'Nipple Piercing (Single/Pair)', type: 'Piercing', estimatedDuration: 45, description: 'Piercing through the nipple.' },
  { id: 'piercing_dermal', name: 'Dermal Anchor', type: 'Piercing', estimatedDuration: 45, description: 'A single-point surface piercing.' },
  { id: 'piercing_adult', name: 'Adult Piercing (Specify in Notes)', type: 'Piercing', estimatedDuration: 60, description: 'For genital piercings. Please specify desired piercing in the notes section. Must be 18+ with valid ID.' },
  
  // Other
  { id: 'other_service', name: 'Other Service (Specify in Notes)', type: 'Other', estimatedDuration: 60, description: 'For any services not listed, such as jewelry changes or custom projects. Please provide details in the notes.' },
];

export const FAQ_DATA: { question: string; answer: string }[] = [
    {
        question: "How much does a tattoo cost?",
        answer: "Tattoo costs vary based on size, complexity, placement, and artist rates. We offer free consultations to discuss your idea and provide a quote."
    },
    {
        question: "Does getting a tattoo hurt?",
        answer: "Yes, there is some pain involved in getting a tattoo, but the level of pain varies depending on the individual's pain tolerance, the location of the tattoo, and the duration of the session. Most people describe it as a scratching or burning sensation."
    },
    {
        question: "How do I prepare for my tattoo appointment?",
        answer: "Get a good night's sleep, eat a healthy meal beforehand, stay hydrated, and avoid alcohol or blood-thinning medications for at least 24 hours prior. Wear comfortable clothing that allows easy access to the area being tattooed."
    },
    {
        question: "What is the aftercare for a tattoo?",
        answer: "Your artist will provide specific aftercare instructions. Generally, it involves keeping the tattoo clean, applying a thin layer of recommended ointment, and avoiding sun exposure, soaking in water (pools, baths), and picking at scabs."
    },
    {
        question: "How long does a piercing take to heal?",
        answer: "Healing times vary greatly depending on the type of piercing and individual healing. Earlobe piercings might take 6-8 weeks, while cartilage piercings can take 6-12 months or longer to fully heal."
    },
    {
        question: "Can I bring my own jewelry for a piercing?",
        answer: "For initial piercings, we typically use high-quality, implant-grade jewelry (like titanium or surgical steel) that we provide to ensure proper healing and minimize risks of reaction. Once healed, you can often switch to other jewelry."
    },
    {
        question: "Do I need an appointment?",
        answer: "Appointments are highly recommended, especially for tattoos, to ensure artist availability. We may accommodate walk-ins for smaller tattoos or piercings if time permits. You can book an appointment through our website."
    }
];