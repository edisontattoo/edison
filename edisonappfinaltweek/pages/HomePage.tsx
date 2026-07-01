


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, SparklesIcon, UserIcon, MapPinIcon, PencilSquareIcon, CalendarDaysIcon, Spinner } from '../components/common/UIElements';
import { AppRoutes } from '../constants';
import { getArtists, getLocations, getHomepageGallery, saveHomepageGallery } from '../services/dataService';
import { Artist, StudioLocation, HomepageGallery } from '../types';
import { useAdmin } from '../contexts/AdminContext';
import GalleryEditModal from '../components/admin/GalleryEditModal';

const HomePage: React.FC = () => {
  const [featuredArtist, setFeaturedArtist] = useState<Artist | null>(null);
  const [featuredLocation, setFeaturedLocation] = useState<StudioLocation | null>(null);
  const [gallery, setGallery] = useState<HomepageGallery>({ images: [] });
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAdmin();
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [artists, locations, galleryData] = await Promise.all([
        getArtists(),
        getLocations(),
        getHomepageGallery()
      ]);
      setFeaturedArtist(artists[0] || null);
      setFeaturedLocation(locations[0] || null);
      setGallery(galleryData);
    } catch (error) {
      console.error("Failed to fetch homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGallerySave = (updatedGallery: HomepageGallery) => {
    setGallery(updatedGallery);
  };

  const FeatureCard: React.FC<{title: string, description: string, linkTo: string, linkText: string, icon: React.ReactNode, imageUrl?: string}> = 
    ({ title, description, linkTo, linkText, icon, imageUrl }) => (
    <Card className="flex flex-col overflow-hidden h-full">
        {imageUrl && <img src={imageUrl} alt={title} className="w-full h-48 object-cover"/>}
        <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-center text-cyan-400 mb-3">
                {icon}
                <h3 className="ml-2 text-xl font-orbitron">{title}</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4 flex-grow">{description}</p>
            <Link to={linkTo}>
                <Button variant="outline" size="sm" className="w-full mt-auto">
                    {linkText}
                </Button>
            </Link>
        </div>
    </Card>
  );
  
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-gray-800 rounded-lg shadow-2xl overflow-hidden p-8 md:p-16 text-center min-h-[400px] flex flex-col justify-center items-center">
        <div className="absolute inset-0 opacity-30">
            <img src="https://images.unsplash.com/photo-1528711200371-b84a9c1ad1f9?q=80&w=1600&h=900&fit=crop" alt="Abstract Tattoo Art" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-orbitron font-bold text-white mb-4">
            Welcome to Edison<span className="text-cyan-400">Tattoo</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience exceptional artistry in tattoos and piercings. Your vision, our expertise.
            </p>
            <Link to={AppRoutes.BOOKING}>
            <Button variant="primary" size="lg">
                Book Your Session
                <CalendarDaysIcon className="w-5 h-5 ml-2" />
            </Button>
            </Link>
        </div>
      </section>

      {/* Key Features Section */}
      <section>
        <h2 className="text-3xl font-orbitron text-center text-cyan-400 mb-8">Explore Our World</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredArtist && <FeatureCard 
            title="Our Artists"
            description={`Meet talented artists like ${featuredArtist.name}, specializing in ${featuredArtist.specialties.join(', ')}. Discover their unique styles.`}
            linkTo={AppRoutes.ARTISTS}
            linkText="View Artist Portfolios"
            icon={<UserIcon className="w-7 h-7" />}
            imageUrl={featuredArtist.avatarUrl}
          />}
          {featuredLocation && <FeatureCard 
            title="Our Studio"
            description={`Visit us at ${featuredLocation.name} located at ${featuredLocation.address}.`}
            linkTo={AppRoutes.LOCATIONS}
            linkText="Find Our Studio"
            icon={<MapPinIcon className="w-7 h-7" />}
            imageUrl={featuredLocation.bannerImageUrl}
          />}
          <FeatureCard 
            title="AI Tools"
            description="Unleash your creativity with our AI Designer, or get answers to your questions from our AI-powered Pro."
            linkTo={AppRoutes.AI_TOOLS}
            linkText="Explore AI Tools"
            icon={<SparklesIcon className="w-7 h-7" />}
            imageUrl="https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&h=400&fit=crop"
          />
        </div>
      </section>

      {/* Call to Action for Release Form */}
      <section className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
        <PencilSquareIcon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-2xl font-orbitron text-white mb-3">Ready for Your Appointment?</h2>
        <p className="text-gray-300 mb-6 max-w-xl mx-auto">
          Save time by completing your release and consent form online before your visit. It's secure, easy, and helps us prepare for your session.
        </p>
        <Link to={AppRoutes.RELEASE_FORM}>
          <Button variant="secondary" size="lg">Complete Your Release Form</Button>
        </Link>
      </section>
      
      {/* Placeholder for gallery or testimonials */}
      <section>
        <div className="flex justify-center items-center mb-8">
            <h2 className="text-3xl font-orbitron text-center text-cyan-400">Glimpse of Our Work</h2>
            {isAuthenticated && (
                <Button onClick={() => setIsGalleryModalOpen(true)} variant="outline" size="sm" className="ml-4">Edit Gallery</Button>
            )}
        </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.images.map((imgUrl, index) => (
                <Card key={index} className="aspect-square">
                    <img src={imgUrl} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover"/>
                </Card>
            ))}
         </div>
      </section>
      
      {isAuthenticated && (
        <GalleryEditModal
          gallery={gallery}
          isOpen={isGalleryModalOpen}
          onClose={() => setIsGalleryModalOpen(false)}
          onSave={handleGallerySave}
        />
      )}
    </div>
  );
};

export default HomePage;