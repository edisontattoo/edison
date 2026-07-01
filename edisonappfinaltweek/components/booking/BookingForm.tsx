

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Input, Select, TextArea, Spinner, Card, CalendarDaysIcon } from '../common/UIElements';
import { getServices, getArtists, getLocations } from '../../services/dataService';
import { Service, Artist, StudioLocation, Appointment } from '../../types';

interface BookingFormProps {
  onDetailsSubmitted: (appointment: Appointment) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ onDetailsSubmitted }) => {
  const locationState = useLocation().state as { artistId?: string, locationId?: string } || {};

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedArtistId, setSelectedArtistId] = useState<string>(locationState.artistId || '');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locationState.locationId || '');
  const [dateTime, setDateTime] = useState('');
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
        setAvailableArtists(allArtists.filter(artist => location.artists?.includes(artist.id)));
      } else {
        setAvailableArtists(allArtists); 
      }
    } else {
      setAvailableArtists(allArtists);
    }
    // If current selected artist is not in the new list of available artists, reset it
    if (selectedArtistId && !availableArtists.find(a => a.id === selectedArtistId)) {
        setSelectedArtistId('');
    }
  }, [selectedLocationId, allArtists, allLocations, selectedArtistId]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const appointmentDetails: Appointment = {
      id: Date.now().toString(), // Temporary ID
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      serviceId: selectedServiceId,
      artistId: selectedArtistId || undefined, // Optional
      locationId: selectedLocationId,
      dateTime: new Date(dateTime),
      notes: notes,
    };
    
    onDetailsSubmitted(appointmentDetails);
  };

  const selectedService = allServices.find(s => s.id === selectedServiceId);

  return (
    <Card className="p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center mb-6">
          <CalendarDaysIcon className="w-8 h-8 text-cyan-400 mr-3" />
          <h2 className="text-2xl font-orbitron text-cyan-400">Book Your Appointment</h2>
        </div>
        <p className="text-sm text-gray-300">
            Step 1 of 2: Request your appointment time. You will be asked to fill out your release form on the next page.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required />
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder=" (555) 123-4567" required />
        
          <Select label="Select Location" value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)} required>
            <option value="">Choose a studio</option>
            {allLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name} - {loc.address}</option>
            ))}
          </Select>

          <Select label="Select Service" value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} required>
            <option value="">Choose a service</option>
            {allServices.map((service) => (
              <option key={service.id} value={service.id}>{service.name} ({service.type})</option>
            ))}
          </Select>
          
          <Select label="Preferred Artist (Optional)" value={selectedArtistId} onChange={(e) => setSelectedArtistId(e.target.value)} disabled={!selectedLocationId && availableArtists.length === 0}>
            <option value="">Any Available Artist</option>
            {availableArtists.map((artist) => (
              <option key={artist.id} value={artist.id}>{artist.name} ({artist.specialties.slice(0,2).join(', ')})</option>
            ))}
          </Select>
        </div>
        
        {selectedService && (
            <div className="p-3 bg-gray-800 rounded-md text-sm text-gray-300">
                <p><strong>Selected Service:</strong> {selectedService.name}</p>
                <p><strong>Type:</strong> {selectedService.type}</p>
                <p><strong>Estimated Duration:</strong> {selectedService.estimatedDuration} minutes</p>
                {selectedService.description && <p className="mt-1 text-xs"><em>{selectedService.description}</em></p>}
            </div>
        )}

        <Input label="Preferred Date & Time" type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} required 
            min={new Date().toISOString().slice(0,16)} // Prevent booking in the past
        />
        
        <TextArea label="Notes / Design Ideas (Optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific requests or ideas? If it's for a tattoo, briefly describe what you're thinking." />

        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || !selectedLocationId || !selectedServiceId} className="w-full">
          {isLoading ? 'Processing...' : 'Next: Fill Release Form'}
        </Button>

        <p className="text-xs text-gray-400 text-center">
            After completing your release form, we will contact you to confirm your appointment details and any deposit requirements.
        </p>
      </form>
    </Card>
  );
};

export default BookingForm;