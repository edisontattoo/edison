

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Input, Select, TextArea, Spinner, Card, ClockIcon } from '../components/common/UIElements';
import { getServices, getArtists, getLocations } from '../services/dataService';
import { Artist, Service, StudioLocation } from '../types';
import { AppRoutes } from '../constants';

// This is a simplified form for walk-in requests
const WalkinForm: React.FC = () => {
  const navigate = useNavigate();
  const locationState = useLocation().state as { artistId?: string, locationId?: string } || {};

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedArtistId, setSelectedArtistId] = useState<string>(locationState.artistId || '');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locationState.locationId || '');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [allLocations, setAllLocations] = useState<StudioLocation[]>([]);
  const [availableArtists, setAvailableArtists] = useState<Artist[]>([]);
  
  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
        const [services, artists, locations] = await Promise.all([
            getServices(),
            getArtists(),
            getLocations()
        ]);
        setAllServices(services);
        setAllArtists(artists);
        setAllLocations(locations);
        if (!locationState.locationId && locations.length > 0) {
            setSelectedLocationId(locations[0].id);
        }
    };
    fetchData();
  }, [locationState.locationId]);

  // Filter artists based on location
  useEffect(() => {
    if (selectedLocationId && allArtists.length > 0) {
      const location = allLocations.find(loc => loc.id === selectedLocationId);
      if (location && location.artists) {
        const filteredArtists = allArtists.filter(artist => location.artists?.includes(artist.id));
        setAvailableArtists(filteredArtists);
        // If current selected artist is not in the new list of available artists, reset it
        if (selectedArtistId && !filteredArtists.find(a => a.id === selectedArtistId)) {
            setSelectedArtistId('');
        }
      } else {
        setAvailableArtists(allArtists); 
      }
    } else {
      setAvailableArtists(allArtists);
    }
  }, [selectedLocationId, allArtists, allLocations, selectedArtistId]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const requestDetails = {
      submissionType: 'Walk-in Waitlist',
      requestedServiceId: selectedServiceId,
      requestedArtistId: selectedArtistId,
      clientNotes: notes,
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      // Date/Time is implicitly today for a walk-in
      requestedDateTime: new Date().toISOString(),
    };
    
    navigate(AppRoutes.RELEASE_FORM, { state: { requestDetails } });
  };

  const selectedService = allServices.find(s => s.id === selectedServiceId);

  return (
    <Card className="p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center mb-6">
          <ClockIcon className="w-8 h-8 text-cyan-400 mr-3" />
          <h2 className="text-2xl font-orbitron text-cyan-400">Join the Walk-in Waitlist</h2>
        </div>
        <p className="text-sm text-gray-300">
            Step 1 of 2: Let us know what you're looking for today. If a spot opens up, we'll contact you. You'll fill out your release form on the next page to be ready to go.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required />
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder=" (555) 123-4567" required />
        
          <Select label="Location" value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)} required>
             {allLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </Select>

          <Select label="Select Service" value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} required>
            <option value="">Choose a service</option>
            {allServices.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </Select>
          
          <Select label="Preferred Artist (Optional)" value={selectedArtistId} disabled={!selectedLocationId}>
            <option value="">Any Available Artist</option>
            {availableArtists.map((artist) => (
              <option key={artist.id} value={artist.id}>{artist.name}</option>
            ))}
          </Select>
        </div>
        
        {selectedService && (
            <div className="p-3 bg-gray-800 rounded-md text-sm text-gray-300">
                <p><strong>Selected Service:</strong> {selectedService.name}</p>
                {selectedService.description && <p className="mt-1 text-xs"><em>{selectedService.description}</em></p>}
            </div>
        )}
        
        <TextArea label="Notes / Design Ideas (Optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific requests or ideas?" />

        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || !selectedServiceId} className="w-full">
          {isLoading ? 'Processing...' : 'Next: Fill Release Form'}
        </Button>

        <p className="text-xs text-gray-400 text-center">
            Completing your release form now significantly speeds up the process if we can get you in today!
        </p>
      </form>
    </Card>
  );
};

const WalkinPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <WalkinForm />
    </div>
  );
};


export default WalkinPage;