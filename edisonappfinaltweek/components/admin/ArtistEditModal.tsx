import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, TextArea, Spinner, XIcon } from '../common/UIElements';
import { FileInput } from '../common/FormControls';
import { Artist, NewArtist } from '../../types';
import { saveArtist } from '../../services/dataService';

interface ArtistEditModalProps {
  artist: NewArtist | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (artist: Artist) => void;
}

const ArtistEditModal: React.FC<ArtistEditModalProps> = ({ artist, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<NewArtist>({ name: '', bio: '', specialties: [], avatarUrl: '', portfolioImages: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData(artist ? { ...artist } : { name: '', bio: '', specialties: [], avatarUrl: '', portfolioImages: [] });
  }, [artist]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'specialties') {
      setFormData(prev => ({ ...prev, specialties: value.split(',').map(s => s.trim()) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (field: 'avatarUrl' | 'portfolioImages') => (file: File | null, dataUrl?: string) => {
    if (field === 'avatarUrl') {
      if (dataUrl) setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
    }
  };

  const handlePortfolioImageAdd = (file: File | null, dataUrl?: string) => {
    if (dataUrl) {
      setFormData(prev => ({ ...prev, portfolioImages: [...(prev.portfolioImages || []), dataUrl] }));
    }
  };

  const handlePortfolioImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolioImages: (prev.portfolioImages || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const savedArtist = await saveArtist(formData);
      onSave(savedArtist);
      onClose();
    } catch (error) {
      console.error("Failed to save artist", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={artist?.id ? 'Edit Artist' : 'Add New Artist'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" label="Artist Name" value={formData.name || ''} onChange={handleChange} required />
        <TextArea name="bio" label="Biography" value={formData.bio || ''} onChange={handleChange} rows={4} required />
        <Input name="specialties" label="Specialties (comma-separated)" value={(formData.specialties || []).join(', ')} onChange={handleChange} placeholder="e.g. Realism, Watercolor" required />
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Avatar Image</label>
          {formData.avatarUrl && <img src={formData.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover mb-2" />}
          <FileInput label={formData.avatarUrl ? 'Change Avatar' : 'Upload Avatar'} id="avatarFile" onFileSelect={handleFileChange('avatarUrl')} accept="image/*" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Portfolio Images</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {(formData.portfolioImages || []).map((img, index) => (
              <div key={index} className="relative group">
                <img src={img} alt={`Portfolio ${index + 1}`} className="w-full h-24 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => handlePortfolioImageRemove(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <FileInput label="Add Portfolio Image" id="portfolioFile" onFileSelect={handlePortfolioImageAdd} accept="image/*" />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Artist'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ArtistEditModal;