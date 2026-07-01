
import React, { useState, useEffect, useCallback } from 'react';
import { StudioLocation, Artist, NewLocation } from '../types';
import { Card, Button, MapPinIcon, UserIcon, Spinner, PencilIcon, TrashIcon } from '../components/common/UIElements';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../constants';
import { useAdmin } from '../contexts/AdminContext';
import { getLocations, getArtists, deleteLocation } from '../services/dataService';
import LocationEditModal from '../components/admin/LocationEditModal';

const LocationCardFull: React.FC<{ location: StudioLocation; artists: Artist[]; onEdit: () => void; onDelete: () => void; }> = ({ location, artists, onEdit, onDelete }) => {
  const { isAuthenticated } = useAdmin();
  const artistsAtLocation = artists.filter(artist => location.artists?.includes(artist.id));

  return (
    <Card className="flex flex-col overflow-hidden relative group">
       {isAuthenticated && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button size="sm" variant="secondary" onClick={onEdit}><PencilIcon className="w-4 h-4" /></Button>
          <Button size="sm" variant="danger" onClick={onDelete}><TrashIcon className="w-4 h-4" /></Button>
        </div>
      )}
      <div className="relative h-56 w-full">
          <img src={location.bannerImageUrl} alt={`${location.name} studio`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <h3 className="absolute bottom-4 left-4 text-2xl font-orbitron text-white">{location.name}</h3>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <p className="text-gray-300 text-sm mb-1"><strong className="text-gray-200">Address:</strong> {location.address}</p>
        <p className="text-gray-300 text-sm mb-1"><strong className="text-gray-200">Phone:</strong> {location.phone}</p>
        <p className="text-gray-300 text-sm mb-4"><strong className="text-gray-200">Hours:</strong> {location.operatingHours}</p>
        
        {artistsAtLocation.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-cyan-400 mb-1">Artists Here:</h4>
            <div className="flex flex-wrap gap-2">
              {artistsAtLocation.map(artist => (
                <span key={artist.id} className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded-full flex items-center">
                  <UserIcon className="w-3 h-3 mr-1"/>{artist.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {location.mapEmbedUrl && (
             <div className="aspect-w-16 aspect-h-9 my-4 rounded-lg overflow-hidden border border-gray-700">
                <iframe
                    src={location.mapEmbedUrl}
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${location.name} Map`}
                ></iframe>
            </div>
        )}
       
        <Link to={AppRoutes.BOOKING} state={{ locationId: location.id }} className="mt-auto block">
            <Button variant="primary" size="sm" className="w-full">
                Book at this Location
            </Button>
        </Link>
      </div>
    </Card>
  );
};

const LocationsPage: React.FC = () => {
    const [locations, setLocations] = useState<StudioLocation[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingLocation, setEditingLocation] = useState<NewLocation | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { isAuthenticated } = useAdmin();

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [locs, arts] = await Promise.all([getLocations(), getArtists()]);
        setLocations(locs);
        setArtists(arts);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenEditModal = (location?: NewLocation) => {
        setEditingLocation(location || null);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingLocation(null);
    };

    const handleSave = () => {
        fetchData(); // Re-fetch data after save
    };

    const handleDelete = async (locationToDelete: StudioLocation) => {
        if (window.confirm(`Are you sure you want to delete ${locationToDelete.name}?`)) {
            try {
                await deleteLocation(locationToDelete.id);
                // Directly update state for an immediate UI response
                setLocations(prevLocations => prevLocations.filter(loc => loc.id !== locationToDelete.id));
            } catch (error) {
                console.error("Failed to delete location:", error);
                alert("There was an error deleting the location.");
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <MapPinIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h1 className="text-4xl font-orbitron text-white">Our Studio</h1>
        <p className="text-lg text-gray-400 mt-2 max-w-2xl mx-auto">
          Visit us at our studio, where we uphold the highest standards of artistry and safety in a unique and welcoming environment.
        </p>
         {isAuthenticated && (
          <div className="mt-4">
            <Button onClick={() => handleOpenEditModal()}>Add New Location</Button>
          </div>
        )}
      </div>

      {locations.length > 0 ? (
        <div className="grid grid-cols-1 md:max-w-3xl mx-auto gap-8">
          {locations.map((location) => (
            <LocationCardFull 
                key={location.id} 
                location={location} 
                artists={artists} 
                onEdit={() => handleOpenEditModal(location)}
                onDelete={() => handleDelete(location)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No locations available at the moment. Add one in Admin Mode!</p>
      )}

      {isAuthenticated && isEditModalOpen && (
        <LocationEditModal
          location={editingLocation}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSave}
        />
      )}
      
      <Card className="mt-12 p-6 bg-gray-800 text-center">
        <h2 className="text-2xl font-orbitron text-white mb-2">Questions about our studio?</h2>
        <p className="text-gray-300 mb-4">
           All our artists work from our Lincoln studio. Check their profiles for inspiration or contact us for assistance.
        </p>
        <Link to={AppRoutes.ARTISTS}>
            <Button variant="outline">View All Artists</Button>
        </Link>
      </Card>
    </div>
  );
};

export default LocationsPage;
