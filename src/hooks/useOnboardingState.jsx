// hooks/useOnboardingState.js
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const useOnboardingState = () => {
    const [currentStep, setCurrentStep] = useState('store-basic');
    const [formData, setFormData] = useState({});
    const [progress, setProgress] = useState(0);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [businessTypeInfo, setBusinessTypeInfo] = useState(null);
    const [uploadedDocs, setUploadedDocs] = useState({});

    const steps = [
        { id: 'store-basic', title: 'Store Basic', icon: '🏪' },
        { id: 'business-details', title: 'Business Details', icon: '📄' },
        { id: 'address', title: 'Address', icon: '📍' },
        { id: 'documents', title: 'Documents', icon: '📎' },
        { id: 'review', title: 'Review', icon: '✅' }
    ];

    const loadOnboardingData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/seller/onboarding/data');
            if (response.data.success) {
                setFormData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load onboarding data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadOnboardingStatus = useCallback(async () => {
        try {
            const response = await api.get('/seller/onboarding/status');
            if (response.data.success) {
                const { data } = response.data;
                setCurrentStep(data.current_step || 'store-basic');
                setProgress(data.progress_percentage || 0);
                
                if (data.business_type_info) {
                    setBusinessTypeInfo(data.business_type_info);
                }
            }
        } catch (error) {
            console.error('Failed to load onboarding status:', error);
        }
    }, []);

    const loadDocumentRequirements = useCallback(async () => {
        try {
            const response = await api.get('/seller/document-requirements');
            if (response.data.success) {
                setUploadedDocs(response.data.data.uploaded_documents || {});
            }
        } catch (error) {
            console.error('Failed to load document requirements:', error);
        }
    }, []);

    const saveStep = async (step, data) => {
        try {
            setIsLoading(true);
            
            // Map step to correct endpoint
            const endpoints = {
                'store-basic': '/seller/onboarding/store-basic',
                'business-details': '/seller/onboarding/business-details',
                'address': '/seller/onboarding/address',
                'documents': '/seller/onboarding/mark-documents-complete',
                'review': '/seller/onboarding/submit'
            };

            const endpoint = endpoints[step];
            if (!endpoint) {
                throw new Error(`No endpoint for step: ${step}`);
            }

            const response = await api.post(endpoint, data);
            
            if (response.data.success) {
                setFormData(prev => ({ ...prev, ...data }));
                
                // Determine next step
                let nextStep = 'store-basic';
                switch(step) {
                    case 'store-basic': nextStep = 'business-details'; break;
                    case 'business-details': nextStep = 'address'; break;
                    case 'address': nextStep = 'documents'; break;
                    case 'documents': nextStep = 'review'; break;
                    case 'review': nextStep = 'complete'; break;
                }
                
                return { 
                    success: true, 
                    nextStep,
                    data: response.data.data 
                };
            }
            return { 
                success: false, 
                errors: response.data.errors,
                message: response.data.message 
            };
        } catch (error) {
            console.error('Save step failed:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to save',
                errors: error.response?.data?.errors 
            };
        } finally {
            setIsLoading(false);
        }
    };

    const uploadDocument = async (file, documentType) => {
        const formData = new FormData();
        formData.append('document_type', documentType);
        formData.append('document', file);

        try {
            const response = await api.post('/seller/onboarding/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success) {
                // Update uploaded documents
                setUploadedDocs(prev => ({
                    ...prev,
                    [documentType]: {
                        uploaded: true,
                        url: response.data.data.url
                    }
                }));
                return { success: true, url: response.data.data.url };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Upload failed' 
            };
        }
    };

    const deleteDocument = async (documentType) => {
        try {
            const response = await api.delete(`/seller/documents/${documentType}`);
            if (response.data.success) {
                setUploadedDocs(prev => {
                    const updated = { ...prev };
                    delete updated[documentType];
                    return updated;
                });
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Delete failed' 
            };
        }
    };

    useEffect(() => {
        loadOnboardingData();
        loadOnboardingStatus();
        loadDocumentRequirements();
    }, [loadOnboardingData, loadOnboardingStatus, loadDocumentRequirements]);

    return {
        currentStep,
        setCurrentStep,
        formData,
        setFormData,
        progress,
        steps,
        isLoading,
        businessTypeInfo,
        uploadedDocs,
        saveStep,
        uploadDocument,
        deleteDocument,
        loadDocumentRequirements,
        loadOnboardingStatus
    };
};