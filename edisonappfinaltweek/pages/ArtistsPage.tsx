

import React, { useState, useEffect, useCallback } from 'react';
import { Artist, NewArtist } from '../types';
import { Card, Button, Modal, UserIcon, SparklesIcon, Spinner, PencilIcon, TrashIcon } from '../components/common/UIElements';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../constants';
import { useAdmin } from '../contexts/AdminContext';
import { getArtists, deleteArtist } from '../services/dataService';
import ArtistEditModal from '../components/admin/ArtistEditModal';

const ArtistCardFull: React.FC<{ artist: Artist; onSelect: () => void; onEdit: () => void; onDelete: () => void; }> = ({ artist, onSelect, onEdit, onDelete }) => {
  const { isAuthenticated } = useAdmin();
  
  return (
    <Card className="flex flex-col overflow-hidden group relative">
      {isAuthenticated && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onEdit(); }}><PencilIcon className="w-4 h-4" /></Button>
          <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); onDelete(); }}><TrashIcon className="w-4 h-4" /></Button>
        </div>
      )}
      <div className="relative h-64 w-full overflow-hidden" onClick={onSelect}>
          <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          <h3 className="absolute bottom-4 left-4 text-2xl font-orbitron text-white group-hover:text-cyan-400 transition-colors">{artist.name}</h3>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <p className="text-sm text-cyan-400 mb-2">{artist.specialties.join(' | ')}</p>
        <p className="text-gray-300 text-sm mb-4 flex-grow line-clamp-3">{artist.bio}</p>
        <Button onClick={onSelect} variant="primary" size="sm" className="w-full mt-auto">
          View Portfolio
        </Button>
      </div>
    </Card>
  );
};

const ArtistPortfolioModal: React.FC<{ artist: Artist | null; onClose: () => void }> = ({ artist, onClose }) => {
  if (!artist) return null;

  return (
    <Modal isOpen={!!artist} onClose={onClose} title={`${artist.name}'s Portfolio`} size="xl">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img src={artist.avatarUrl} alt={artist.name} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg border-2 border-cyan-500" />
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-orbitron text-cyan-400">{artist.name}</h2>
            <p className="text-gray-400 mt-1">{artist.specialties.join(', ')}</p>
            <p className="text-gray-300 mt-3 text-sm">{artist.bio}</p>
          </div>
        </div>
        
        <div>
            <h4 className="text-xl font-orbitron text-gray-200 mb-3">Gallery</h4>
            {artist.portfolioImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                {artist.portfolioImages.map((img, index) => (
                    <div key={index} className="aspect-square bg-gray-700 rounded-lg overflow-hidden shadow-md">
                    <img src={img} alt={`${artist.name} portfolio work ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-gray-500">No portfolio images available yet.</p>
            )}
        </div>

        <Link to={AppRoutes.BOOKING} state={{ artistId: artist.id }}>
            <Button variant="primary" className="w-full mt-4">Book with {artist.name}</Button>
        </Link>
      </div>
    </Modal>
  );
};

const ArtistsPage: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [editingArtist, setEditingArtist] = useState<NewArtist | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { isAuthenticated } = useAdmin();

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    const data = await getArtists();
    setArtists(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const handleOpenPortfolio = (artist: Artist) => {
    setSelectedArtist(artist);
  };

  const handleOpenEditModal = (artist?: NewArtist) => {
    setEditingArtist(artist || null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingArtist(null);
  };
  
  const handleSave = () => {
      fetchArtists(); // Re-fetch all artists after saving
  }

  const handleDelete = async (artistToDelete: Artist) => {
    if (window.confirm(`Are you sure you want to delete ${artistToDelete.name}? This cannot be undone.`)) {
        try {
            await deleteArtist(artistToDelete.id);
            // Re-fetch the artists list to ensure UI is in sync with data source
            fetchArtists();
        } catch (error) {
            console.error("Failed to delete artist:", error);
            alert("There was an error deleting the artist.");
        }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <UserIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h1 className="text-4xl font-orbitron text-white">Meet Our Artists</h1>
        <p className="text-lg text-gray-400 mt-2 max-w-2xl mx-auto">
          Discover the talented individuals behind our studio's exceptional tattoo and piercing work.
        </p>
        {isAuthenticated && (
          <div className="mt-4">
            <Button onClick={() => handleOpenEditModal()}>Add New Artist</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {artists.map((artist) => (
          <ArtistCardFull 
            key={artist.id} 
            artist={artist} 
            onSelect={() => handleOpenPortfolio(artist)} 
            onEdit={() => handleOpenEditModal(artist)}
            onDelete={() => handleDelete(artist)}
          />
        ))}
      </div>

      <ArtistPortfolioModal artist={selectedArtist} onClose={() => setSelectedArtist(null)} />
      {isAuthenticated && isEditModalOpen && (
        <ArtistEditModal
            artist={editingArtist}
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            onSave={handleSave}
        />
      )}
      
      <Card className="mt-12 p-6 bg-gray-800 text-center">
        <SparklesIcon className="w-10 h-10 text-cyan-400 mx-auto mb-3"/>
        <h2 className="text-2xl font-orbitron text-white mb-2">Looking for Tattoo Ideas?</h2>
        <p className="text-gray-300 mb-4">
            Use our AI Tattoo Designer to brainstorm concepts before your consultation!
        </p>
        <Link to={AppRoutes.AI_TOOLS}>
            <Button variant="outline">Try AI Tools</Button>
        </Link>
      </Card>
    </div>
  );
};

export default ArtistsPage;