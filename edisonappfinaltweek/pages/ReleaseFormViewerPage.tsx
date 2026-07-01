import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getReleaseFormById } from '../services/storageService';
import { getServices, getArtists, getAppSettings } from '../services/dataService';
import { ReleaseFormData, Service, Artist } from '../types';
import { Spinner, Card, Button, ArrowDownTrayIcon } from '../components/common/UIElements';
import { AppRoutes } from '../constants';

const DetailItem: React.FC<{ label: string; value?: string | string[] | null | boolean }> = ({ label, value }) => {
  let displayValue: string;
  if (value === undefined || value === null || value === '') {
    displayValue = 'N/A';
  } else if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No';
  } else if (Array.isArray(value)) {
    displayValue = value.length > 0 ? value.join(', ') : 'None specified';
  } else {
    displayValue = value;
  }

  return (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 print-layout-fix">
      <dt className="text-sm font-medium text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-200 sm:mt-0 sm:col-span-2 break-words">{displayValue}</dd>
    </div>
  );
};

const Section: React.FC<{ title: string, children: React.ReactNode, border?: boolean }> = ({ title, children, border = true }) => (
  <div className={border ? "border-t border-gray-600 pt-4 mt-4 print-border" : ""}>
    <h3 className="text-lg leading-6 font-orbitron font-medium text-cyan-400 mb-2">{title}</h3>
    <dl>{children}</dl>
  </div>
);

const ImageDisplay: React.FC<{ label: string, src?: string }> = ({ label, src }) => (
    <div className="py-2">
        <p className="text-sm font-medium text-gray-400 mb-2">{label}</p>
        {src ? (
            <img src={src} alt={label} className="max-w-xs max-h-48 border-2 border-gray-600 rounded-lg shadow-md bg-white p-1 printable-image" />
        ) : (
            <p className="text-sm text-gray-500">No image provided.</p>
        )}
    </div>
);


const ReleaseFormViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<ReleaseFormData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [waiverText, setWaiverText] = useState('');
  const [submissionEmail, setSubmissionEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No form ID provided.");
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        const [formData, servicesData, artistsData, settings] = await Promise.all([
            getReleaseFormById(id),
            getServices(),
            getArtists(),
            getAppSettings()
        ]);

        if (formData) {
          setForm(formData);
          setServices(servicesData);
          setArtists(artistsData);
          setWaiverText(settings.waiverText);
          setSubmissionEmail(settings.submissionEmail);
        } else {
          setError("Release form not found. It may have been cleared from this browser's storage.");
        }
      } catch (e) {
        setError("Failed to retrieve the release form data.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  const handleEmail = () => {
    if (!form || !submissionEmail) return;

    const subject = `Release Form Submission: ${form.fullName}`;
    
    // Create a text-based representation of the form data for the email body.
    const bodyParts = [
      `Form Submission Details for: ${form.fullName}`,
      `Date Signed: ${form.dateSigned}`,
      '---',
      'This email contains a summary of the release form. The full form with signatures and ID images has been downloaded to your device.',
      'Please attach the recently downloaded PDF file to this email before sending.',
      '---',
      ...Object.entries(form).map(([key, value]) => {
          if (typeof value === 'string' && value && !key.toLowerCase().includes('url') && !key.toLowerCase().includes('data')) {
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return `${label}: ${value}`;
          }
          return null;
      }).filter(Boolean)
    ];

    const body = encodeURIComponent(bodyParts.join('\n'));
    window.location.href = `mailto:${submissionEmail}?subject=${encodeURIComponent(subject)}&body=${body}`;
  };

  const handleGenerateAndEmail = async () => {
    if (!form) return;
    const formContent = document.getElementById('form-content');
    if (!formContent) {
      setError("Could not find form content to generate PDF.");
      return;
    }
    
    setIsGenerating(true);

    try {
        const canvas = await html2canvas(formContent, {
            scale: 2,
            backgroundColor: '#1F2937', // The card background color
            useCORS: true, // Important for external images to be rendered
        });

        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / pdfWidth;
        const imgHeight = canvasHeight / ratio;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = position - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`release-form-${form.fullName.replace(/\s+/g, '_')}.pdf`);

        // After saving, trigger the email
        handleEmail();

    } catch (e) {
        console.error("Error generating PDF:", e);
        setError("An error occurred while generating the PDF. Please try saving manually and attaching to an email.");
    } finally {
        setIsGenerating(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
        <p className="ml-4 text-gray-300">Loading Release Form...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <Card className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
        <p className="text-gray-300 mb-6">{error || "Could not display the release form."}</p>
        <Link to={AppRoutes.RELEASE_FORM}>
          <Button variant="primary">Fill Out a New Form</Button>
        </Link>
      </Card>
    );
  }
  
  const requestedService = form.requestedServiceId ? services.find(s => s.id === form.requestedServiceId)?.name : 'N/A';
  const requestedArtist = form.requestedArtistId ? artists.find(a => a.id === form.requestedArtistId)?.name : 'Any Available';
  
  return (
    <div>
        <Card className="p-6 md:p-8 mb-8 text-center bg-gray-800 print-hidden">
            <h1 className="text-3xl font-orbitron text-cyan-400 mb-3">Form Complete! What's Next?</h1>
            <p className="text-gray-300 max-w-2xl mx-auto mb-6">
                Thank you, {form.fullName}. Your form has been generated. Please use the button below to save a PDF copy and open your email client. You will need to attach the downloaded PDF to the email.
            </p>
            <div className="flex justify-center gap-4">
                <Button variant="primary" size="lg" onClick={handleGenerateAndEmail} isLoading={isGenerating} disabled={isGenerating}>
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate PDF & Email'}
                </Button>
            </div>
            <p className="text-xs text-gray-400 mt-4">This action will first download the PDF to your device, then open your default email app. Please attach the downloaded file.</p>
        </Card>

        <Card className="p-6 md:p-8 bg-gray-800 printable-card">
            <div id="form-content">
                <div className="text-center mb-6 pb-4 border-b border-gray-600 print-border">
                    <h2 className="text-2xl font-bold font-orbitron text-cyan-400">Edison Tattoo And Body Piercing</h2>
                    <p className="text-lg font-semibold text-gray-200">Client Consent & Release Form (Confirmation Copy)</p>
                </div>

                <div className="space-y-6">
                    {(form.submissionType === 'Booking Request' || form.submissionType === 'Walk-in Waitlist') && (
                        <Section title="Request Details" border={false}>
                            <DetailItem label="Submission Type" value={form.submissionType} />
                            {form.submissionType === 'Booking Request' && form.requestedDateTime && <DetailItem label="Requested Date & Time" value={new Date(form.requestedDateTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })} />}
                            <DetailItem label="Requested Service" value={requestedService} />
                            <DetailItem label="Requested Artist" value={requestedArtist} />
                            <DetailItem label="Client Notes" value={form.clientNotes} />
                        </Section>
                    )}
                    
                    <Section title="Waiver and Release Agreement" border={true}>
                        <div className="text-sm text-gray-300 space-y-3 whitespace-pre-wrap">
                            {waiverText}
                        </div>
                    </Section>
                    
                    <Section title="Client Information" border={true}>
                        <DetailItem label="Full Legal Name" value={form.fullName} />
                        <DetailItem label="Date of Birth" value={form.dateOfBirth} />
                        <DetailItem label="Address" value={form.address} />
                        <DetailItem label="Phone" value={form.phone} />
                        <DetailItem label="Email" value={form.email} />
                        <DetailItem label="Emergency Contact" value={`${form.emergencyContactName} (${form.emergencyContactPhone})`} />
                        <DetailItem label="Is Minor" value={form.isMinor} />
                    </Section>
                    
                    {form.isMinor && (
                        <Section title="Parent/Guardian Consent">
                            <DetailItem label="Guardian Name" value={form.guardianName} />
                            <DetailItem label="Relationship" value={form.guardianRelationship} />
                            <ImageDisplay label="Guardian ID" src={form.guardianIdFileUrl} />
                            <ImageDisplay label="Guardian Signature" src={form.guardianSignatureDataUrl} />
                        </Section>
                    )}

                    <Section title="Procedure Details">
                        <DetailItem label="Procedure Type" value={form.procedureType} />
                        <DetailItem label="Description" value={form.procedureDescription} />
                        <DetailItem label="Placement" value={form.procedurePlacement} />
                    </Section>

                    <Section title="Medical History">
                        <DetailItem label="Conditions Disclosed" value={form.medicalConditions} />
                        <DetailItem label="Allergies" value={form.allergies} />
                        <DetailItem label="Medications" value={form.medications} />
                        <DetailItem label="Pregnant or Nursing" value={form.isPregnantOrNursing} />
                    </Section>

                    <Section title="Consent & Identification">
                        <DetailItem label="Agrees to Risks" value={form.agreesToRisks} />
                        <DetailItem label="Agrees to Aftercare" value={form.agreesToAftercare} />
                        <DetailItem label="Photo Release Consent" value={form.photoReleaseConsent} />
                        <DetailItem label="ID Type" value={form.identificationType} />
                        <DetailItem label="ID Number" value={form.identificationNumber} />
                        <ImageDisplay label="Client ID" src={form.identificationFileUrl} />
                    </Section>

                    <Section title="Signature">
                        <DetailItem label="Date Signed" value={form.dateSigned} />
                        <ImageDisplay label="Client Signature" src={form.signatureDataUrl} />
                    </Section>
                </div>
            </div>
        </Card>
    </div>
  );
};

export default ReleaseFormViewerPage;