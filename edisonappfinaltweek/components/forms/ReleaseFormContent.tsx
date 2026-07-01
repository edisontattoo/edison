

import React, { useState, useCallback, useEffect } from 'react';
import { ReleaseFormData, FormStep } from '../../types';
import { Button, Input, TextArea, Select, Checkbox, Spinner, SparklesIcon } from '../common/UIElements';
import { FileInput, SignaturePad, FingerprintScanner } from '../common/FormControls';
import { generateText } from '../../services/geminiService';
import { getAppSettings } from '../../services/dataService';

interface ReleaseFormContentProps {
  formData: ReleaseFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReleaseFormData>>;
  onSubmit: (data: ReleaseFormData) => void;
  isSubmitting: boolean;
}

const SectionWrapper: React.FC<{ title: string, children: React.ReactNode, step?: FormStep, currentStep?: FormStep }> = ({ title, children, step, currentStep }) => {
  if (step !== undefined && currentStep !== undefined && step !== currentStep) return null;
  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-xl font-orbitron text-cyan-400 mb-4 border-b border-gray-700 pb-2">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

const ReleaseFormContent: React.FC<ReleaseFormContentProps> = ({ formData, setFormData, onSubmit, isSubmitting }) => {
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.PersonalInfo);
  const [aiSummary, setAiSummary] = useState<{ section: string, summary: string, isLoading: boolean } | null>(null);
  const [waiverText, setWaiverText] = useState('');
  const [medicalConditionsOptions, setMedicalConditionsOptions] = useState<string[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [isAiEnabled, setIsAiEnabled] = useState(false);

  useEffect(() => {
    getAppSettings().then(settings => {
      setWaiverText(settings.waiverText);
      setMedicalConditionsOptions(settings.medicalConditions);
      setLoadingSettings(false);
    });

    if (process.env.API_KEY) {
      setIsAiEnabled(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      if (name === "medicalConditions") { // Handle multi-checkbox for medicalConditions
        setFormData(prev => ({
          ...prev,
          medicalConditions: checked
            ? [...prev.medicalConditions, value]
            : prev.medicalConditions.filter(item => item !== value)
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (name: keyof ReleaseFormData) => (file: File | null, dataUrl?: string) => {
    setFormData(prev => ({ ...prev, [name]: file, [`${name}Url`]: dataUrl }));
  };

  const handleSignatureSave = (name: keyof ReleaseFormData) => (dataUrl: string) => {
    setFormData(prev => ({ ...prev, [name]: dataUrl }));
  };

  const handleFingerprintCapture = (credentialId: string) => {
    setFormData(prev => ({ ...prev, guardianFingerprintToken: credentialId }));
  };

  const handleIsMinorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isMinor = e.target.value === 'yes';
    setFormData(prev => ({ ...prev, isMinor, guardianName: '', guardianRelationship: '', guardianSignatureDataUrl: '', guardianIdFile: null, guardianIdFileUrl: undefined }));
  };

  const today = new Date().toISOString().split('T')[0];

  const handleSubmitInternal = () => {
    if (!formData.identificationFile || !formData.identificationType || !formData.identificationNumber) {
      alert("Please provide ID information.");
      return;
    }
    if (!formData.signatureDataUrl) {
      alert("Client signature is required.");
      return;
    }
    if (formData.isMinor && !formData.guardianSignatureDataUrl) {
      alert("Guardian signature is required for minors.");
      return;
    }
    if (formData.isMinor && !formData.guardianIdFile) {
      alert("Guardian ID is required for minors.");
      return;
    }
    if (formData.isMinor && !formData.guardianFingerprintToken) {
      alert("Parent/Guardian fingerprint is required for minor consent.");
      return;
    }
    if (formData.isMinor && !formData.minorSignatureDataUrl) {
      alert("Minor's signature is required.");
      return;
    }
    if (!formData.agreesToRisks || !formData.agreesToAftercare) {
      alert("You must agree to risks and aftercare.");
      return;
    }
    onSubmit({ ...formData, dateSigned: today });
  };

  const nextStep = () => {
    // Basic validation before proceeding (example for current step)
    // Add more robust validation as needed for each step
    if (currentStep === FormStep.PersonalInfo) {
      if (!formData.fullName || !formData.dateOfBirth || !formData.address || !formData.phone || !formData.email || !formData.emergencyContactName || !formData.emergencyContactPhone) {
        alert("Please fill all required fields in Client Information.");
        return;
      }
      if (formData.isMinor === null) {
        alert("Please specify if you are 18 or older.");
        return;
      }
    }
    if (currentStep === FormStep.MinorConsent && formData.isMinor) {
      if (!formData.guardianName || !formData.guardianRelationship || !formData.guardianIdFile || !formData.guardianSignatureDataUrl) {
        alert("Please fill all required guardian fields in Parent/Guardian Consent.");
        return;
      }
      if (!formData.guardianFingerprintToken) {
        alert("Parent/Guardian fingerprint scan is required.");
        return;
      }
      if (!formData.minorSignatureDataUrl) {
        alert("Minor child's signature is required.");
        return;
      }
    }
    if (currentStep === FormStep.ProcedureDetails) {
      if (!formData.procedureType) {
        alert("Please select a procedure type.");
        return;
      }
    }
    // End Basic Validation


    if (currentStep === FormStep.PersonalInfo && formData.isMinor) setCurrentStep(FormStep.MinorConsent);
    else if (currentStep === FormStep.PersonalInfo && !formData.isMinor) setCurrentStep(FormStep.ProcedureDetails);
    else if (currentStep === FormStep.MinorConsent) setCurrentStep(FormStep.ProcedureDetails);
    else if (currentStep === FormStep.ProcedureDetails) setCurrentStep(FormStep.MedicalInfo);
    else if (currentStep === FormStep.MedicalInfo) setCurrentStep(FormStep.ConsentAndSignature);
    else if (currentStep === FormStep.ConsentAndSignature) handleSubmitInternal(); // Final step
  };

  const prevStep = () => {
    if (currentStep === FormStep.ProcedureDetails && formData.isMinor) setCurrentStep(FormStep.MinorConsent);
    else if (currentStep === FormStep.ProcedureDetails && !formData.isMinor) setCurrentStep(FormStep.PersonalInfo);
    else if (currentStep === FormStep.MinorConsent) setCurrentStep(FormStep.PersonalInfo);
    else if (currentStep === FormStep.MedicalInfo) setCurrentStep(FormStep.ProcedureDetails);
    else if (currentStep === FormStep.ConsentAndSignature) setCurrentStep(FormStep.MedicalInfo);
  };

  const handleExplainWithAI = useCallback(async (sectionTitle: string) => {
    const textToExplain = waiverText;
    if (!textToExplain) {
      setAiSummary({ section: sectionTitle, summary: "Content for AI explanation not available for this section.", isLoading: false });
      return;
    }
    setAiSummary({ section: sectionTitle, summary: "", isLoading: true });
    const prompt = `Explain the following legal/medical text from a tattoo/piercing consent form in simple, easy-to-understand terms for a layperson. Focus on the key takeaways and what the person is agreeing to or acknowledging:\n\n"${textToExplain}"`;
    const summary = await generateText(prompt, "You are a helpful AI assistant that simplifies complex text.");
    setAiSummary({ section: sectionTitle, summary, isLoading: false });
  }, [waiverText]);

  if (loadingSettings) {
    return <div className="flex justify-center items-center h-64"><Spinner /> <span className="ml-2">Loading form...</span></div>;
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmitInternal(); }} className="space-y-8">

      <SectionWrapper title="Client Information" step={FormStep.PersonalInfo} currentStep={currentStep}>
        <Input name="fullName" label="Full Legal Name" value={formData.fullName} onChange={handleChange} required />
        <Input name="dateOfBirth" label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={handleChange} max={today} required />
        <Input name="address" label="Full Address" value={formData.address} onChange={handleChange} required />
        <Input name="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleChange} required />
        <Input name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} required />
        <Input name="emergencyContactName" label="Emergency Contact Name" value={formData.emergencyContactName} onChange={handleChange} required />
        <Input name="emergencyContactPhone" label="Emergency Contact Phone" type="tel" value={formData.emergencyContactPhone} onChange={handleChange} required />

        <fieldset className="mt-2">
          <legend className="text-sm font-medium text-gray-300 mb-1">Are you 18 years of age or older?</legend>
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-gray-300">
              <input type="radio" name="isMinorRadio" value="no" checked={formData.isMinor === false} onChange={handleIsMinorChange} className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600" />
              <span className="ml-2">Yes, I am 18 or older</span>
            </label>
            <label className="flex items-center text-gray-300">
              <input type="radio" name="isMinorRadio" value="yes" checked={formData.isMinor === true} onChange={handleIsMinorChange} className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600" />
              <span className="ml-2">No, I am under 18 (Minor)</span>
            </label>
          </div>
        </fieldset>
      </SectionWrapper>

      {formData.isMinor && (
        <SectionWrapper title="Parent/Guardian Consent (For Minors)" step={FormStep.MinorConsent} currentStep={currentStep}>
          <p className="text-sm text-yellow-300 bg-yellow-900/50 p-3 rounded-md">
            Important: For clients under 18, a parent or legal guardian must complete this section and be present during the procedure, as per state and local regulations.
          </p>
          <div className="text-sm text-gray-300 p-3 my-2 bg-gray-700 rounded-md">
            <h4 className="font-semibold text-gray-200 mb-2">Acceptable Identification for Minor:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Original Birth Certificate (we will make a copy)</li>
              <li>School ID with a photo</li>
              <li>State or Federally issued photo ID (e.g., State ID card, Passport)</li>
            </ul>
            <div className="mt-3 p-2 bg-red-900/50 border border-red-500/50 rounded-md">
              <p className="font-bold text-red-300">SECURITY NOTICE: Do NOT upload a Social Security Card.</p>
              <p className="text-xs text-red-200 mt-1">Due to security risks, we do not accept digital uploads of Social Security cards. Please bring a physical photocopy to your appointment.</p>
            </div>
          </div>

          <Input name="guardianName" label="Parent/Guardian Full Name" value={formData.guardianName || ''} onChange={handleChange} required={formData.isMinor} />
          <Input name="guardianRelationship" label="Relationship to Minor" value={formData.guardianRelationship || ''} onChange={handleChange} required={formData.isMinor} />
          <FileInput
            label="Upload Parent/Guardian's Valid Photo ID"
            id="guardianIdFile"
            onFileSelect={(file, dataUrl) => handleFileChange('guardianIdFile')(file, dataUrl)}
            accept="image/*,.pdf"
            required={formData.isMinor}
            currentFileUrl={formData.guardianIdFileUrl}
          />

          {/* Guardian Signature */}
          <SignaturePad
            label="Parent/Guardian Signature"
            onSave={handleSignatureSave('guardianSignatureDataUrl')}
            existingSignatureUrl={formData.guardianSignatureDataUrl}
            required={formData.isMinor}
          />

          {/* Guardian Fingerprint — required for minor consent */}
          <FingerprintScanner
            label="Parent/Guardian Fingerprint Verification"
            onCapture={handleFingerprintCapture}
            captured={!!formData.guardianFingerprintToken}
            required={formData.isMinor}
            note="Required for minor consent forms. Parent or legal guardian must scan their right index finger. This device's built-in fingerprint reader will be used — no photo is taken."
          />

          {/* Minor Child Signature */}
          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-300 mb-3">
              The minor client must also sign below to acknowledge they understand the procedure.
            </p>
            <SignaturePad
              label="Minor Client Signature"
              onSave={handleSignatureSave('minorSignatureDataUrl')}
              existingSignatureUrl={formData.minorSignatureDataUrl}
              required={formData.isMinor}
            />
          </div>
        </SectionWrapper>
      )}

      <SectionWrapper title="Procedure Details" step={FormStep.ProcedureDetails} currentStep={currentStep}>
        <Select name="procedureType" label="Type of Procedure" value={formData.procedureType} onChange={handleChange} required>
          <option value="">Select type...</option>
          <option value="Tattoo">Tattoo</option>
          <option value="Piercing">Piercing</option>
        </Select>
        <TextArea name="procedureDescription" label="Description of Tattoo/Piercing (e.g., 'Rose on forearm', 'Nostril piercing - left side')" value={formData.procedureDescription || ''} onChange={handleChange} />
        <Input name="procedurePlacement" label="Placement on Body" value={formData.procedurePlacement || ''} onChange={handleChange} />
      </SectionWrapper>

      <SectionWrapper title="Medical Information" step={FormStep.MedicalInfo} currentStep={currentStep}>
        <p className="text-sm text-gray-300">Please disclose any conditions that might affect your procedure or healing. This information is confidential.</p>
        <fieldset>
          <legend className="text-sm font-medium text-gray-300 mb-2">Do you have any of the following? (Check all that apply)</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {medicalConditionsOptions.map(condition => (
              <Checkbox
                key={condition}
                id={`condition-${condition.replace(/\s+/g, '-')}`}
                name="medicalConditions"
                label={condition}
                value={condition}
                checked={formData.medicalConditions.includes(condition)}
                onChange={handleChange}
              />
            ))}
          </div>
        </fieldset>
        <TextArea name="allergies" label="List any known allergies (e.g., latex, metals, specific inks, adhesives)" value={formData.allergies} onChange={handleChange} />
        <TextArea name="medications" label="List any medications you are currently taking (including over-the-counter, blood thinners)" value={formData.medications} onChange={handleChange} />
        <fieldset className="mt-2">
          <legend className="text-sm font-medium text-gray-300 mb-1">Are you pregnant or nursing?</legend>
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-gray-300">
              <input type="radio" name="isPregnantOrNursing" value="yes" checked={formData.isPregnantOrNursing === true} onChange={() => setFormData(p => ({ ...p, isPregnantOrNursing: true }))} className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600" />
              <span className="ml-2">Yes</span>
            </label>
            <label className="flex items-center text-gray-300">
              <input type="radio" name="isPregnantOrNursing" value="no" checked={formData.isPregnantOrNursing === false} onChange={() => setFormData(p => ({ ...p, isPregnantOrNursing: false }))} className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600" />
              <span className="ml-2">No</span>
            </label>
          </div>
          {formData.isPregnantOrNursing === true && <p className="text-xs text-yellow-300 mt-1">Note: We generally do not perform procedures on pregnant or nursing individuals due to potential risks. Please discuss with our staff.</p>}
        </fieldset>
      </SectionWrapper>

      <SectionWrapper title="Consent, Release, and Signature" step={FormStep.ConsentAndSignature} currentStep={currentStep}>
        <div className="space-y-3 text-sm text-gray-300">
          <h4 className="text-md font-semibold text-gray-200">Risks and Complications:</h4>
          <p className="text-xs max-h-24 overflow-y-auto bg-gray-900 p-2 rounded border border-gray-700 whitespace-pre-wrap">{waiverText}</p>

          {isAiEnabled && (
            <Button
              variant="outline" size="sm"
              onClick={() => handleExplainWithAI("Risks and Complications")}
              disabled={aiSummary?.isLoading && aiSummary.section === "Risks and Complications"}
              className="mt-1 mb-2 text-xs"
              type="button"
            >
              {aiSummary?.isLoading && aiSummary.section === "Risks and Complications" ? <Spinner size="sm" className="mr-1" /> : <SparklesIcon className="w-4 h-4 mr-1" />}
              Explain this section with AI
            </Button>
          )}

          {aiSummary && aiSummary.section === "Risks and Complications" && (
            <div className="p-3 my-2 bg-gray-700 rounded-md text-gray-200 text-xs">
              <strong>AI Explanation:</strong> {aiSummary.isLoading ? "Loading..." : aiSummary.summary}
            </div>
          )}

          <p className="font-semibold text-gray-100">By checking the boxes and signing below, I acknowledge and agree to the following:</p>
          <Checkbox name="agreesToRisks" label="I have read and understood the potential risks and complications, and I consent to the procedure." checked={formData.agreesToRisks} onChange={handleChange} required />
          <Checkbox name="agreesToAftercare" label="I agree to follow all aftercare instructions provided. I understand that failure to do so is my own responsibility." checked={formData.agreesToAftercare} onChange={handleChange} required />
          <Checkbox name="photoReleaseConsent" label="I consent to photographs/videos of my tattoo/piercing being taken and used by the studio for promotional purposes (optional)." checked={formData.photoReleaseConsent} onChange={handleChange} />
          <Checkbox name="subscribeToMarketing" label="Subscribe to our newsletter for updates and promotions (optional)." checked={formData.subscribeToMarketing || false} onChange={handleChange} />
          <p>I certify that I am over 18 years of age (or that parental/guardian consent is provided if under 18), not under the influence of alcohol or drugs, and have voluntarily chosen to undergo this procedure.</p>
          <p className="text-xs text-gray-400">A copy of this completed form will be provided to you. All information is kept confidential.</p>
        </div>

        <FileInput
          label="Upload Your Valid Photo ID (e.g., Driver's License, Passport)"
          id="identificationFile"
          onFileSelect={(file, dataUrl) => handleFileChange('identificationFile')(file, dataUrl)}
          accept="image/*,.pdf"
          required
          currentFileUrl={formData.identificationFileUrl}
        />
        <Input name="identificationType" label="Type of ID Provided" value={formData.identificationType} onChange={handleChange} placeholder="e.g., Driver's License" required />
        <Input name="identificationNumber" label="ID Number" value={formData.identificationNumber} onChange={handleChange} required />

        <SignaturePad label="Client Signature" onSave={handleSignatureSave('signatureDataUrl')} existingSignatureUrl={formData.signatureDataUrl} />
        <Input name="dateSigned" label="Date Signed" type="date" value={today} readOnly disabled className="bg-gray-600" />
      </SectionWrapper>

      <div className="flex justify-between items-center pt-6 border-t border-gray-700">
        <div>
          {currentStep !== FormStep.PersonalInfo && (
            <Button onClick={prevStep} variant="secondary" type="button">Previous</Button>
          )}
        </div>
        <div>
          {currentStep !== FormStep.ConsentAndSignature ? (
            <Button onClick={nextStep} variant="primary" className="ml-auto" type="button">Next</Button>
          ) : (
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting || !formData.agreesToRisks || !formData.agreesToAftercare || !formData.signatureDataUrl || !formData.identificationFile || (formData.isMinor && (!formData.guardianSignatureDataUrl || !formData.guardianIdFile || !formData.guardianFingerprintToken || !formData.minorSignatureDataUrl))}>
              {isSubmitting ? 'Submitting...' : 'Submit Release Form'}
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center mt-4">
        Disclaimer: This form is a template for demonstration purposes. Consult with legal counsel to ensure compliance with all local and state regulations for tattoo and body piercing consent.
      </p>
    </form>
  );
};

export default ReleaseFormContent;