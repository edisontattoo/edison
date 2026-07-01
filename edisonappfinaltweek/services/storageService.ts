import { ReleaseFormData } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Saves a new release form to the backend.
 * @param formData The form data to save, without an ID.
 * @returns The newly created form data, including its assigned ID.
 */
export const saveReleaseForm = async (formData: Omit<ReleaseFormData, 'id'>): Promise<ReleaseFormData> => {
    try {
        const response = await fetch(`${API_BASE_URL}/forms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save form');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error("Error saving release form:", error);
        throw error;
    }
};


/**
 * Retrieves a single release form by its ID from the backend.
 * @param id The unique identifier of the form.
 * @returns The form data, or null if not found.
 */
export const getReleaseFormById = async (id: string): Promise<ReleaseFormData | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/forms/${id}`);

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch form');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error("Error fetching release form:", error);
        return null;
    }
};

/**
 * Retrieves a list of all saved forms from the backend.
 * @returns An array of all form data.
 */
export const getAllReleaseForms = async (): Promise<ReleaseFormData[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/forms`);

        if (!response.ok) {
            throw new Error('Failed to fetch forms');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error("Error fetching release forms:", error);
        return [];
    }
};

