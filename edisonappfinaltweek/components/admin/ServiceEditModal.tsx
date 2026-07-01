
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, TextArea, Select, Spinner } from '../common/UIElements';
import { Service, NewService } from '../../types';
import { saveService } from '../../services/dataService';

interface ServiceEditModalProps {
  service: NewService | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
}

const ServiceEditModal: React.FC<ServiceEditModalProps> = ({ service, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<NewService>({ name: '', type: 'Tattoo', estimatedDuration: 30, description: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData(service ? { ...service } : { name: '', type: 'Tattoo', estimatedDuration: 30, description: '' });
  }, [service]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? parseInt(value, 10) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const savedService = await saveService(formData);
      onSave(savedService);
      onClose();
    } catch (error) {
      console.error("Failed to save service", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={service?.id ? 'Edit Service' : 'Add New Service'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" label="Service Name" value={formData.name || ''} onChange={handleChange} required />
        
        <Select name="type" label="Service Type" value={formData.type || 'Tattoo'} onChange={handleChange}>
            <option value="Tattoo">Tattoo</option>
            <option value="Piercing">Piercing</option>
            <option value="Other">Other</option>
        </Select>

        <Input name="estimatedDuration" label="Estimated Duration (minutes)" type="number" value={formData.estimatedDuration || 30} onChange={handleChange} required />
        
        <TextArea name="description" label="Description" value={formData.description || ''} onChange={handleChange} rows={3} />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Service'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ServiceEditModal;
