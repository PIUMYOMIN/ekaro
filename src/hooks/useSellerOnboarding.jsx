// hooks/useOnboardingState.js
import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useOnboardingState = () => {
    const [currentStep, setCurrentStep] = useState('store-basic');
    const [formData, setFormData] = useState({});
    const [progress, setProgress] = useState(0);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const steps = [
        { id: 'store-basic', title: 'Store Basic', icon: '🏪' },
        { id: 'business-details', title: 'Business Details', icon: '📄' },
        { id: 'address', title: 'Address', icon: '📍' },
        { id: 'documents', title: 'Documents', icon: '📎' },
        { id: 'review', title: 'Review', icon: '✅' }
    ];

    const loadOnboardingData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/seller/onboarding/data');
            if (response.data.success) {
                setFormData(response.data.data);
                // Determine current step from progress
                const statusResponse = await api.get('/seller/onboarding/status');
                if (statusResponse.data.success) {
                    setCurrentStep(statusResponse.data.data.current_step);
                    setProgress(statusResponse.data.data.progress_percentage || 0);
                }
            }
        } catch (error) {
            console.error('Failed to load onboarding data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveStep = async (step, data) => {
        try {
            setIsLoading(true);
            const response = await api.post(`/seller/onboarding/step/${step}`, data);
            
            if (response.data.success) {
                setFormData(prev => ({ ...prev, ...data }));
                setCurrentStep(response.data.next_step);
                setProgress(response.data.progress);
                return { success: true, nextStep: response.data.next_step };
            }
            return { success: false, errors: response.data.errors };
        } catch (error) {
            console.error('Save step failed:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to save' };
        } finally {
            setIsLoading(false);
        }
    };

    const uploadDocument = async (file, type) => {
        const formData = new FormData();
        formData.append('document_type', type);
        formData.append('document', file);

        try {
            const response = await api.post('/seller/onboarding/upload-document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success) {
                setDocuments(prev => [...prev, { type, url: response.data.data.url }]);
                return { success: true, url: response.data.data.url };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: 'Upload failed' };
        }
    };

    useEffect(() => {
        loadOnboardingData();
    }, []);

    return {
        currentStep,
        setCurrentStep,
        formData,
        setFormData,
        progress,
        steps,
        isLoading,
        saveStep,
        uploadDocument,
        documents
    };
};