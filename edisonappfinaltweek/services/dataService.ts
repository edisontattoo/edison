


import { Artist, StudioLocation, Service, SocialLinks, HomepageGallery, NewArtist, NewLocation, NewService, AppSettings } from '../types';
import { mockArtists, mockLocations, mockServices } from './mockDataService';

const ARTISTS_KEY = 'app_data_artists';
const LOCATIONS_KEY = 'app_data_locations';
const SERVICES_KEY = 'app_data_services';
const SOCIAL_LINKS_KEY = 'app_data_social_links';
const GALLERY_KEY = 'app_data_gallery';
const SETTINGS_KEY = 'app_data_settings';


// Helper to get data from localStorage or return a default value
const getData = <T,>(key: string, defaultValue: T): T => {
    try {
        const storedData = localStorage.getItem(key);
        return storedData ? JSON.parse(storedData) : defaultValue;
    } catch (error) {
        console.error(`Error parsing data from localStorage for key ${key}:`, error);
        return defaultValue;
    }
};

// Helper to set data to localStorage
const setData = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving data to localStorage for key ${key}:`, error);
    }
};

// --- Initialization ---
export const initializeData = () => {
    if (!localStorage.getItem(ARTISTS_KEY)) {
        setData(ARTISTS_KEY, mockArtists);
    }
    if (!localStorage.getItem(LOCATIONS_KEY)) {
        setData(LOCATIONS_KEY, mockLocations);
    }
    if (!localStorage.getItem(SERVICES_KEY)) {
        setData(SERVICES_KEY, mockServices);
    }
    if (!localStorage.getItem(SOCIAL_LINKS_KEY)) {
        setData(SOCIAL_LINKS_KEY, { facebook: '#', instagram: '#', twitter: '#' });
    }
    if (!localStorage.getItem(GALLERY_KEY)) {
        setData(GALLERY_KEY, { 
            images: [
                'https://images.unsplash.com/photo-1615985984259-717a63a5fb8b?q=80&w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1620358229314-c8d08595563a?q=80&w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1541893361138-2fca73479a49?q=80&w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1516222543178-8d48443e498c?q=80&w=400&h=400&fit=crop',
            ]
        });
    }
    // Always enforce correct credentials regardless of what's stored
    const existingSettings = getData<any>(SETTINGS_KEY, null);
    if (existingSettings) {
        existingSettings.credentials = { user: 'edisontattoollc@gmail.com', pass: 'Jesusfreak#1' };
        setData(SETTINGS_KEY, existingSettings);
    }

    if (!localStorage.getItem(SETTINGS_KEY)) {
        setData(SETTINGS_KEY, {
            credentials: { user: 'edisontattoollc@gmail.com', pass: 'Jesusfreak#1' },
            waiverText: `PLEASE READ CAREFULLY. THIS IS A LEGAL DOCUMENT.

I, the undersigned client, acknowledge that I have been fully informed of the inherent risks associated with getting a tattoo and/or body piercing. I understand that these risks, known and unknown, can lead to injury, including but not to: infection, scarring (including keloid formation), bleeding, bruising, swelling, allergic reactions to pigments, metals, latex, or other materials, and nerve damage.

I understand that tattoos are permanent markings on the skin and that their removal is difficult, expensive, and may not be fully successful. I also understand that the appearance of my tattoo may change over time due to sun exposure, aging, and other factors.

I agree to follow all instructions concerning the care of my tattoo/piercing while it is healing. I understand that failure to do so may increase my risk of complications and that Edison Tattoo And Body Piercing and its artists are not responsible for any issues arising from my failure to follow these aftercare instructions.

I certify that I am over 18 years of age and competent to sign this agreement. If under 18, I certify that my legal guardian is present, has provided their consent within this form, and will be present during the procedure. I am not under the influence of alcohol or drugs. All information I have provided in this form is true and accurate to the best of my knowledge.

I hereby release and forever discharge Edison Tattoo And Body Piercing, its owners, artists, employees, and agents from any and all claims, damages, or legal actions arising from or connected in any way with my tattoo/piercing or the procedures and conduct used in performing my tattoo/piercing, to the fullest extent allowed by law.

PHOTO RELEASE (Optional): If I have checked the "Photo Release Consent" box, I consent to the taking of photographs or videos of my tattoo/piercing and grant Edison Tattoo And Body Piercing the right to use these for promotional purposes, including but not to social media, websites, and print advertising, without compensation.

I have read this agreement, I understand it, and I agree to be bound by it. I have been given the opportunity to ask questions, and all my questions have been answered to my satisfaction.
`,
            medicalConditions: [
                "Diabetes", "Epilepsy", "Hemophilia", "Hepatitis", "HIV/AIDS", 
                "Heart Condition", "High/Low Blood Pressure", "Skin Diseases (Eczema, Psoriasis)", 
                "Currently on Antibiotics", "Prone to Fainting", "Prone to Keloid Scarring", "None of the above"
            ],
            submissionEmail: 'edisontattoogateway@gmail.com'
        });
    }
};

// --- Data Accessors ---
export const getArtists = (): Promise<Artist[]> => Promise.resolve(getData(ARTISTS_KEY, []));
export const getLocations = (): Promise<StudioLocation[]> => Promise.resolve(getData(LOCATIONS_KEY, []));
export const getServices = (): Promise<Service[]> => Promise.resolve(getData(SERVICES_KEY, []));
export const getSocialLinks = (): Promise<SocialLinks> => Promise.resolve(getData(SOCIAL_LINKS_KEY, { facebook: '#', instagram: '#', twitter: '#' }));
export const getHomepageGallery = (): Promise<HomepageGallery> => Promise.resolve(getData(GALLERY_KEY, { images: [] }));
export const getAppSettings = (): Promise<AppSettings> => Promise.resolve(getData(SETTINGS_KEY, {
     credentials: { user: 'admin', pass: 'password' }, waiverText: '', medicalConditions: [], submissionEmail: ''
}));


// --- Data Mutators ---

// Artists
export const saveArtist = async (artistToSave: NewArtist): Promise<Artist> => {
    const artists = await getArtists();
    if (artistToSave.id) { // Editing existing artist
        const index = artists.findIndex(a => a.id === artistToSave.id);
        if (index > -1) {
            artists[index] = artistToSave as Artist;
        }
    } else { // Adding new artist
        artistToSave.id = `artist_${Date.now()}`;
        artists.push(artistToSave as Artist);
    }
    setData(ARTISTS_KEY, artists);
    return artistToSave as Artist;
};

export const deleteArtist = async (artistId: string): Promise<void> => {
    let artists = await getArtists();
    artists = artists.filter(a => a.id !== artistId);
    setData(ARTISTS_KEY, artists);
};

// Locations
export const saveLocation = async (locationToSave: NewLocation): Promise<StudioLocation> => {
    const locations = await getLocations();
    if (locationToSave.id) { // Editing
        const index = locations.findIndex(l => l.id === locationToSave.id);
        if (index > -1) {
            locations[index] = locationToSave as StudioLocation;
        }
    } else { // Adding
        locationToSave.id = `loc_${Date.now()}`;
        locations.push(locationToSave as StudioLocation);
    }
    setData(LOCATIONS_KEY, locations);
    return locationToSave as StudioLocation;
};

export const deleteLocation = async (locationId: string): Promise<void> => {
    let locations = await getLocations();
    locations = locations.filter(l => l.id !== locationId);
    setData(LOCATIONS_KEY, locations);
};

// Services
export const saveService = async (serviceToSave: NewService): Promise<Service> => {
    const services = await getServices();
    if (serviceToSave.id) { // Editing
        const index = services.findIndex(s => s.id === serviceToSave.id);
        if (index > -1) {
            services[index] = serviceToSave as Service;
        }
    } else { // Adding
        serviceToSave.id = `service_${Date.now()}`;
        services.push(serviceToSave as Service);
    }
    setData(SERVICES_KEY, services);
    return serviceToSave as Service;
};

export const deleteService = async (serviceId: string): Promise<void> => {
    let services = await getServices();
    services = services.filter(s => s.id !== serviceId);
    setData(SERVICES_KEY, services);
};


// Social Links
export const saveSocialLinks = async (links: SocialLinks): Promise<void> => {
    setData(SOCIAL_LINKS_KEY, links);
};

// Homepage Gallery
export const saveHomepageGallery = async (gallery: HomepageGallery): Promise<void> => {
    setData(GALLERY_KEY, gallery);
};

// App Settings
export const saveAppSettings = async (settings: AppSettings): Promise<void> => {
    setData(SETTINGS_KEY, settings);
};