

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../../constants';
import { useAdmin } from '../../contexts/AdminContext';
import { getSocialLinks, saveSocialLinks } from '../../services/dataService';
import { SocialLinks } from '../../types';
import { Cog6ToothIcon, Button, Input } from '../common/UIElements';
import LoginModal from '../admin/LoginModal';

const Footer: React.FC = () => {
  const { isAuthenticated, logout } = useAdmin();
  const [links, setLinks] = useState<SocialLinks>({ facebook: '', instagram: '', twitter: '' });
  const [editableLinks, setEditableLinks] = useState<SocialLinks>({ facebook: '', instagram: '', twitter: '' });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  useEffect(() => {
    getSocialLinks().then(data => {
      setLinks(data);
      setEditableLinks(data);
    });
  }, []);

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableLinks(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveLinks = () => {
    saveSocialLinks(editableLinks).then(() => {
      setLinks(editableLinks);
      alert("Social links updated!");
    });
  };

  const handleAdminClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <footer className="bg-gray-800 text-gray-400 shadow-inner mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h5 className="font-orbitron text-lg font-semibold text-cyan-400 mb-3">Your Studio Name</h5>
              <p className="text-sm">
                Your premier destination for custom tattoos and professional piercings. Artistry, safety, and creativity combined.
              </p>
            </div>
            <div>
              <h5 className="text-md font-semibold text-gray-200 mb-3">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li><Link to={AppRoutes.HOME} className="hover:text-cyan-400 transition-colors">Home</Link></li>
                <li><Link to={AppRoutes.BOOKING} className="hover:text-cyan-400 transition-colors">Book Appointment</Link></li>
                <li><Link to={AppRoutes.ARTISTS} className="hover:text-cyan-400 transition-colors">Our Artists</Link></li>
                <li><Link to={AppRoutes.LOCATIONS} className="hover:text-cyan-400 transition-colors">Studio Location</Link></li>
                <li><Link to={AppRoutes.RELEASE_FORM} className="hover:text-cyan-400 transition-colors">Release Form</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-md font-semibold text-gray-200 mb-3">Connect</h5>
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Input label="Facebook URL" name="facebook" value={editableLinks.facebook} onChange={handleLinkChange} />
                  <Input label="Instagram URL" name="instagram" value={editableLinks.instagram} onChange={handleLinkChange} />
                  <Input label="Twitter URL" name="twitter" value={editableLinks.twitter} onChange={handleLinkChange} />
                  <Button onClick={handleSaveLinks} size="sm" variant="primary" className="mt-2">Save Links</Button>
                </div>
              ) : (
                <>
                  <p className="text-sm">
                    Follow us on social media for the latest designs and updates!
                  </p>
                  <div className="flex space-x-4 mt-3">
                    <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Facebook</a>
                    <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Instagram</a>
                    <a href={links.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Twitter</a>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 flex justify-center items-center text-center">
            <p className="text-sm flex-grow">&copy; {new Date().getFullYear()} Your Studio Name. All rights reserved.</p>
            <button onClick={handleAdminClick} title={isAuthenticated ? 'Logout' : 'Admin Login'} className={`p-2 rounded-full ${isAuthenticated ? 'bg-cyan-500 text-white' : 'text-gray-500 hover:bg-gray-700 hover:text-white'}`}>
                <Cog6ToothIcon className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </footer>
      {!isAuthenticated && (
        <LoginModal 
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </>
  );
};

export default Footer;