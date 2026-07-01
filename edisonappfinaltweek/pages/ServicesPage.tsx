
import React, { useState, useEffect, useCallback } from 'react';
import { Service, NewService } from '../types';
import { getServices, deleteService } from '../services/dataService';
import { useAdmin } from '../contexts/AdminContext';
import { Card, Button, Spinner, PencilIcon, TrashIcon, WrenchScrewdriverIcon } from '../components/common/UIElements';
import ServiceEditModal from '../components/admin/ServiceEditModal';

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<NewService | null>(null);
  const { isAuthenticated } = useAdmin();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const data = await getServices();
    setServices(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenModal = (service?: NewService) => {
    setEditingService(service || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSave = () => {
    fetchServices(); // Re-fetch after save
  };

  const handleDelete = async (serviceId: string, serviceName: string) => {
    if (window.confirm(`Are you sure you want to delete the service "${serviceName}"?`)) {
      try {
        await deleteService(serviceId);
        // Directly update state for an immediate UI response
        setServices(prevServices => prevServices.filter(service => service.id !== serviceId));
      } catch (error) {
          console.error("Failed to delete service:", error);
          alert("There was an error deleting the service.");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
        <p className="text-gray-300">You must be logged in as an administrator to view this page.</p>
      </Card>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
            <WrenchScrewdriverIcon className="w-10 h-10 text-cyan-400 mr-4" />
            <div>
                <h1 className="text-4xl font-orbitron text-white">Manage Services</h1>
                <p className="text-lg text-gray-400 mt-1">Add, edit, or remove studio services.</p>
            </div>
        </div>
        <Button onClick={() => handleOpenModal()}>Add New Service</Button>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
            <table className="min-w-full">
            <thead className="bg-gray-700">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duration (min)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
                {services.map((service) => (
                <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{service.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{service.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{service.estimatedDuration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => handleOpenModal(service)}>
                            <PencilIcon className="w-4 h-4"/>
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(service.id, service.name)}>
                            <TrashIcon className="w-4 h-4"/>
                        </Button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </Card>
      
      {isModalOpen && (
        <ServiceEditModal
            service={editingService}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ServicesPage;
