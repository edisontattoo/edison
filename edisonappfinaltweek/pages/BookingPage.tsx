
import React from 'react';
import BookingForm from '../components/booking/BookingForm';
import { Appointment } from '../types';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../constants';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleDetailsSubmitted = (appointment: Appointment) => {
    // Navigate to the release form, passing the booking details in the state.
    // This connects the two parts of the process.
    navigate(AppRoutes.RELEASE_FORM, { 
      state: { 
        requestDetails: {
          submissionType: 'Booking Request',
          requestedServiceId: appointment.serviceId,
          requestedArtistId: appointment.artistId,
          requestedDateTime: appointment.dateTime.toISOString().slice(0, 16),
          clientNotes: appointment.notes,
          clientName: appointment.clientName,
          clientEmail: appointment.clientEmail,
          clientPhone: appointment.clientPhone,
        }
      } 
    });
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <BookingForm onDetailsSubmitted={handleDetailsSubmitted} />
    </div>
  );
};

export default BookingPage;
