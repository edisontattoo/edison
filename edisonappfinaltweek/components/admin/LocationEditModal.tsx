import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Spinner, Checkbox } from '../common/UIElements';
import { FileInput } from '../common/FormControls';
import { StudioLocation, Artist, NewLocation } from '../../types';
import { saveLocation, getArtists } from '../../services/dataService';

interface LocationEditModalProps {
  location: NewLocation | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: StudioLocation) => void;
}

const LocationEditModal: React.FC<LocationEditModalProps> = ({ location, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<NewLocation>({ name: '', address: '', phone: '', operatingHours: '', bannerImageUrl: '', artists: [] });
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData(location ? { ...location } : { name: '', address: '', phone: '', operatingHours: '', bannerImageUrl: '', artists: [] });
    getArtists().then(setAllArtists);
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArtistToggle = (artistId: string) => {
    setFormData(prev => {
      const currentArtists = prev.artists || [];
      const updatedArtists = currentArtists.includes(artistId)
        ? currentArtists.filter(id => id !== artistId)
        : [...currentArtists, artistId];
      return { ...prev, artists: updatedArtists };
    });
  };

  const handleFileChange = (file: File | null, dataUrl?: string) => {
    if (dataUrl) setFormData(prev => ({ ...prev, bannerImageUrl: dataUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const savedLocation = await saveLocation(formData);
      onSave(savedLocation);
      onClose();
    } catch (error) {
      console.error("Failed to save location", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={location?.id ? 'Edit Location' : 'Add New Location'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" label="Location Name" value={formData.name || ''} onChange={handleChange} required />
        <Input name="address" label="Address" value={formData.address || ''} onChange={handleChange} required />
        <Input name="phone" label="Phone" value={formData.phone || ''} onChange={handleChange} required />
        <Input name="operatingHours" label="Operating Hours" value={formData.operatingHours || ''} onChange={handleChange} required />
        <Input name="mapEmbedUrl" label="Google Maps Embed URL" value={formData.mapEmbedUrl || ''} onChange={handleChange} />
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Banner Image</label>
          {formData.bannerImageUrl && <img src={formData.bannerImageUrl} alt="Banner" className="w-full h-32 object-cover rounded mb-2" />}
          <FileInput label={formData.bannerImageUrl ? 'Change Banner' : 'Upload Banner'} id="bannerFile" onFileSelect={handleFileChange} accept="image/*" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Artists at this Location</label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-700 rounded">
            {allArtists.map(artist => (
              <Checkbox
                key={artist.id}
                id={`artist-check-${artist.id}`}
                label={artist.name}
                checked={(formData.artists || []).includes(artist.id)}
                onChange={() => handleArtistToggle(artist.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Location'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LocationEditModal;