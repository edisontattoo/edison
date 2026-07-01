


import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AppRoutes } from '../../constants';
import { MenuIcon, XIcon, SparklesIcon, UserIcon, CalendarDaysIcon, MapPinIcon, PencilSquareIcon, ChatBubbleLeftEllipsisIcon, ClockIcon, WrenchScrewdriverIcon, Cog6ToothIcon } from '../common/UIElements';
import { useAdmin } from '../../contexts/AdminContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAdmin();

  const navItems = [
    { path: AppRoutes.HOME, label: 'Home', icon: <SparklesIcon className="w-5 h-5 mr-2" />, admin: false },
    { path: AppRoutes.BOOKING, label: 'Book Now', icon: <CalendarDaysIcon className="w-5 h-5 mr-2" />, admin: false },
    { path: AppRoutes.WALK_IN, label: 'Walk-in Waitlist', icon: <ClockIcon className="w-5 h-5 mr-2" />, admin: false },
    { path: AppRoutes.ARTISTS, label: 'Artists', icon: <UserIcon className="w-5 h-5 mr-2" />, admin: false },
    { path: AppRoutes.LOCATIONS, label: 'Studio', icon: <MapPinIcon className="w-5 h-5 mr-2" />, admin: false },
    { path: AppRoutes.RELEASE_FORM, label: 'Release Form', icon: <PencilSquareIcon className="w-5 h-5 mr-2" />, admin: false },
    { path: AppRoutes.AI_TOOLS, label: 'AI Tools', icon: <SparklesIcon className="w-5 h-5 mr-2" />, admin: false },
    { path: AppRoutes.MANAGE_SERVICES, label: 'Manage Services', icon: <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />, admin: true },
    { path: AppRoutes.ADMIN_SETTINGS, label: 'Admin Settings', icon: <Cog6ToothIcon className="w-5 h-5 mr-2" />, admin: true },
  ];

  const NavLinkItem: React.FC<{path: string, label: string, icon: React.ReactNode, onClick?: () => void}> = ({ path, label, icon, onClick }) => (
     <NavLink
        to={path}
        onClick={onClick}
        className={({ isActive }) =>
          `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? 'bg-cyan-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`
        }
      >
        {icon}
        {label}
    </NavLink>
  );

  const visibleNavItems = navItems.filter(item => !item.admin || (item.admin && isAuthenticated));


  return (
    <nav className="bg-gray-800 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to={AppRoutes.HOME} className="flex-shrink-0 text-white font-orbitron text-2xl font-bold tracking-wider">
              Your<span className="text-cyan-400">Studio</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {visibleNavItems.map(item => <NavLinkItem key={item.path} {...item} />)}
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? <MenuIcon className="block h-6 w-6" /> : <XIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {visibleNavItems.map(item => <NavLinkItem key={item.path} {...item} onClick={() => setIsOpen(false)} />)}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;