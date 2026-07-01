

import React, { useState, useEffect } from 'react';
import ReleaseFormContent from '../components/forms/ReleaseFormContent';
import { ReleaseFormData } from '../types';
import { Card, PencilSquareIcon } from '../components/common/UIElements';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveReleaseForm } from '../services/storageService';

const baseInitialFormData: Omit<ReleaseFormData, 'id'> = {
  submissionType: 'Standard Release',
  fullName: '',
  dateOfBirth: '',
  address: '',
  phone: '',
  email: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  procedureType: '',
  procedureDescription: '',
  procedurePlacement: '',
  medicalConditions: [],
  allergies: '',
  medications: '',
  isPregnantOrNursing: null,
  agreesToRisks: false,
  agreesToAftercare: false,
  photoReleaseConsent: false,
  identificationType: '',
  identificationNumber: '',
  identificationFile: null,
  identificationFileUrl: '',
  signatureDataUrl: '',
  dateSigned: '',
  isMinor: false, // Default to adult
  guardianName: '',
  guardianRelationship: '',
  guardianSignatureDataUrl: '',
  guardianIdFile: null,
  guardianIdFileUrl: '',
  guardianFingerprintToken: '',
  minorSignatureDataUrl: '',
  clientNotes: '',
  requestedArtistId: '',
  requestedDateTime: '',
  requestedServiceId: ''
};


const ReleaseFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestDetails = location.state?.requestDetails;

  const getInitialFormData = () => {
    const initialState = { ...baseInitialFormData };
    if (requestDetails) {
        return {
            ...initialState,
            ...requestDetails,
            fullName: requestDetails.clientName || '',
            email: requestDetails.clientEmail || '',
            phone: requestDetails.clientPhone || '',
            clientNotes: requestDetails.clientNotes || '',
        };
    }
    return initialState;
  };

  const [formData, setFormData] = useState<Omit<ReleaseFormData, 'id'>>(getInitialFormData());
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Omit<ReleaseFormData, 'id'>) => {
    setIsSubmitting(true);
    
    // Combine the form data with the initial request details from state
    const finalData = { ...requestDetails, ...data };
    
    // Create a new object for storage, removing non-serializable File objects.
    // The data URLs (e.g., identificationFileUrl) are already in the object and are strings.
    const dataForStorage = { ...finalData };
    delete (dataForStorage as any).identificationFile;
    delete (dataForStorage as any).guardianIdFile;

    try {
      const savedForm = await saveReleaseForm(dataForStorage as Omit<ReleaseFormData, 'id'>);
      // Navigate to the viewer page on success
      navigate(`/release-form/view/${savedForm.id}`);
    } catch (error) {
      console.error("Failed to submit form:", error);
      alert(`Error: ${(error as Error).message || 'An unknown error occurred.'}`);
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch(formData.submissionType) {
        case 'Booking Request':
            return 'Book Appointment & Release Form';
        case 'Walk-in Waitlist':
            return 'Walk-in Waitlist & Release Form';
        default:
            return 'Tattoo & Piercing Release Form';
    }
  };

  const getDescription = () => {
     switch(formData.submissionType) {
        case 'Booking Request':
        case 'Walk-in Waitlist':
            return 'Step 2 of 2: Please complete all sections accurately to finalize your request.';
        default:
            return 'Please complete all sections accurately.';
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6 md:p-8">
        <div className="flex items-center mb-6">
          <PencilSquareIcon className="w-10 h-10 text-cyan-400 mr-4" />
          <div>
            <h1 className="text-3xl font-orbitron text-white">{getTitle()}</h1>
            <p className="text-gray-400">{getDescription()}</p>
          </div>
        </div>
        <ReleaseFormContent 
          formData={formData as ReleaseFormData} // Cast for the component, it won't have the id yet but that's fine
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
};

export default ReleaseFormPage;