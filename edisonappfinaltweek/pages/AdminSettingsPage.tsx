
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input, TextArea, Spinner, Cog6ToothIcon } from '../components/common/UIElements';
import { getAppSettings, saveAppSettings } from '../services/dataService';
import { useAdmin } from '../contexts/AdminContext';
import { AppSettings } from '../types';

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-6 bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-xl font-orbitron text-cyan-400 mb-4 border-b border-gray-700 pb-2">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const AdminSettingsPage: React.FC = () => {
    const { isAuthenticated } = useAdmin();
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<{ [key: string]: 'saving' | 'saved' | 'error' | null }>({});

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAppSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSettingsChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings(prev => prev ? { ...prev, [key]: value } : null);
    };
    
    const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setSettings(prev => prev ? { ...prev, credentials: { ...prev.credentials, [name]: value } } : null);
    }

    const handleMedicalConditionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const lines = e.target.value.split('\n').map(line => line.trim()).filter(line => line);
        handleSettingsChange('medicalConditions', lines);
    };

    const handleSave = async (section: keyof AppSettings) => {
        if (!settings) return;
        setSaveStatus(prev => ({ ...prev, [section]: 'saving' }));
        try {
            await saveAppSettings(settings);
            setSaveStatus(prev => ({ ...prev, [section]: 'saved' }));
            setTimeout(() => setSaveStatus(prev => ({ ...prev, [section]: null })), 2000); // Reset status after 2s
        } catch (error) {
            setSaveStatus(prev => ({ ...prev, [section]: 'error' }));
            console.error(`Failed to save section ${section}:`, error);
        }
    };
    
    const getButtonContent = (section: keyof AppSettings) => {
        switch (saveStatus[section]) {
            case 'saving': return <><Spinner size="sm" className="mr-2"/>Saving...</>;
            case 'saved': return 'Saved!';
            case 'error': return 'Error!';
            default: return 'Save Changes';
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
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }

    if (!settings) {
        return <div className="text-center text-red-400">Failed to load settings.</div>
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center">
                <Cog6ToothIcon className="w-12 h-12 text-cyan-400 mr-4" />
                <div>
                    <h1 className="text-4xl font-orbitron text-white">Admin Settings</h1>
                    <p className="text-lg text-gray-400 mt-1">Manage core application configurations.</p>
                </div>
            </div>

            <SettingsSection title="Administrator Credentials">
                <Input name="user" label="Username" value={settings.credentials.user} onChange={handleCredentialChange} />
                <Input name="pass" label="Password" type="password" value={settings.credentials.pass} onChange={handleCredentialChange} />
                <Button onClick={() => handleSave('credentials')} disabled={saveStatus.credentials === 'saving'}>{getButtonContent('credentials')}</Button>
            </SettingsSection>
            
            <SettingsSection title="Release Form Waiver Text">
                <TextArea
                    name="waiverText"
                    label="Waiver Content"
                    value={settings.waiverText}
                    onChange={(e) => handleSettingsChange('waiverText', e.target.value)}
                    rows={15}
                    className="text-sm font-mono"
                />
                <Button onClick={() => handleSave('waiverText')} disabled={saveStatus.waiverText === 'saving'}>{getButtonContent('waiverText')}</Button>
            </SettingsSection>
            
            <SettingsSection title="Release Form Medical Conditions">
                <TextArea
                    name="medicalConditions"
                    label="Medical Conditions Checklist (one item per line)"
                    value={settings.medicalConditions.join('\n')}
                    onChange={handleMedicalConditionsChange}
                    rows={10}
                />
                <Button onClick={() => handleSave('medicalConditions')} disabled={saveStatus.medicalConditions === 'saving'}>{getButtonContent('medicalConditions')}</Button>
            </SettingsSection>
            
             <SettingsSection title="Form Submission Email">
                <Input
                    name="submissionEmail"
                    label="Email Address for 'Email to Studio' Button"
                    type="email"
                    value={settings.submissionEmail}
                    onChange={(e) => handleSettingsChange('submissionEmail', e.target.value)}
                />
                <Button onClick={() => handleSave('submissionEmail')} disabled={saveStatus.submissionEmail === 'saving'}>{getButtonContent('submissionEmail')}</Button>
            </SettingsSection>

        </div>
    );
};

export default AdminSettingsPage;
