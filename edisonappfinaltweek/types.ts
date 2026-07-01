


export interface Artist {
  id: string;
  name: string;
  specialties: string[];
  bio: string;
  portfolioImages: string[];
  avatarUrl: string;
}

export interface StudioLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  operatingHours: string;
  mapEmbedUrl?: string;
  bannerImageUrl: string;
  artists?: string[]; // IDs of artists at this location
}

export interface Service {
  id: string;
  name: string;
  type: 'Tattoo' | 'Piercing' | 'Other';
  estimatedDuration: number; // in minutes
  description?: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  artistId?: string;
  locationId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  dateTime: Date;
  notes?: string;
}

export interface ReleaseFormData {
  id: string; // Unique identifier for the submission
  submissionType: 'Standard Release' | 'Booking Request' | 'Walk-in Waitlist';

  // Optional appointment details linked to the submission
  requestedServiceId?: string;
  requestedArtistId?: string;
  requestedDateTime?: string; // from datetime-local input
  clientNotes?: string;

  fullName: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;

  procedureType: 'Tattoo' | 'Piercing' | '';
  procedureDescription?: string;
  procedurePlacement?: string;

  medicalConditions: string[];
  allergies: string;
  medications: string;
  isPregnantOrNursing: boolean | null;

  agreesToRisks: boolean;
  agreesToAftercare: boolean;
  photoReleaseConsent: boolean;
  subscribeToMarketing?: boolean;

  identificationType: string;
  identificationNumber: string;
  identificationFile?: File | null;
  identificationFileUrl?: string;

  signatureDataUrl?: string;
  dateSigned: string;

  // For minors
  isMinor: boolean;
  guardianName?: string;
  guardianRelationship?: string;
  guardianSignatureDataUrl?: string;
  guardianIdFile?: File | null;
  guardianIdFileUrl?: string;
  guardianFingerprintToken?: string; // WebAuthn credential ID (base64) — guardian biometric
  minorSignatureDataUrl?: string;   // Minor child's own signature
}

export enum FormStep {
  PersonalInfo,
  ProcedureDetails,
  MedicalInfo,
  ConsentAndSignature,
  MinorConsent, // If applicable
  Confirmation,
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Grounding metadata from Gemini API
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web: GroundingChunkWeb;
}
export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}
export interface CandidateWithGrounding {
  // other candidate properties
  groundingMetadata?: GroundingMetadata;
}

// Admin-editable data types
export interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
}

export interface HomepageGallery {
  images: string[];
}

export interface AppSettings {
  credentials: {
    user: string;
    pass: string;
  };
  waiverText: string;
  medicalConditions: string[];
  submissionEmail: string;
}

// Use Partial for creation forms where ID is not yet assigned
export type NewArtist = Omit<Artist, 'id'> & { id?: string };
export type NewLocation = Omit<StudioLocation, 'id'> & { id?: string };
export type NewService = Omit<Service, 'id'> & { id?: string };