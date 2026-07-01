import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Spinner, TrashIcon } from '../common/UIElements';
import { HomepageGallery } from '../../types';
import { saveHomepageGallery } from '../../services/dataService';

interface GalleryEditModalProps {
  gallery: HomepageGallery;
  isOpen: boolean;
  onClose: () => void;
  onSave: (gallery: HomepageGallery) => void;
}

const GalleryEditModal: React.FC<GalleryEditModalProps> = ({ gallery, isOpen, onClose, onSave }) => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setImages(gallery.images || []);
  }, [gallery]);

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleAddImage = () => {
    setImages([...images, '']);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const updatedGallery = { images: images.filter(img => img.trim() !== '') };
    try {
      await saveHomepageGallery(updatedGallery);
      onSave(updatedGallery);
      onClose();
    } catch (error) {
      console.error("Failed to save gallery", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Homepage Gallery" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {images.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
                <Input
                label={`Image ${index + 1} URL`}
                value={url}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
                />
                <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveImage(index)} className="mt-6">
                <TrashIcon className="w-4 h-4" />
                </Button>
            </div>
            ))}
        </div>

        <Button type="button" variant="outline" onClick={handleAddImage}>Add Image</Button>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Gallery'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GalleryEditModal;
