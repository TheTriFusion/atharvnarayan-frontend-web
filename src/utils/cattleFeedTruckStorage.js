// ==================== CATTLE FEED TRUCK SYSTEM ====================

import { usersAPI } from './api';

// Cattle Feed Truck Owners functions
export const getCattleFeedTruckOwners = async () => {
    try {
        const response = await usersAPI.getUsers({ role: 'cattleFeedTruckOwner', systemType: 'cattleFeedTruck' });
        return response.success ? response.data : [];
    } catch (error) {
        console.error('Error fetching cattle feed truck owners:', error);
        return [];
    }
};

export const getPendingCattleFeedTruckOwners = async () => {
    try {
        const response = await usersAPI.getUsers({
            role: 'cattleFeedTruckOwner',
            systemType: 'cattleFeedTruck',
            onboardingStatus: 'pending',
            isActive: 'false'
        });
        return response.success ? response.data : [];
    } catch (error) {
        console.error('Error fetching pending cattle feed truck owners:', error);
        return [];
    }
};

export const approveCattleFeedTruckOwner = async (id, updates = {}) => {
    try {
        const response = await usersAPI.updateUser(id, {
            isActive: true,
            onboardingStatus: 'approved',
            ...updates
        });
        return response.success ? response.data : null;
    } catch (error) {
        console.error('Error approving cattle feed truck owner:', error);
        throw error;
    }
};

export const addCattleFeedTruckOwner = async (owner) => {
    try {
        const ownerData = {
            ...owner,
            role: 'cattleFeedTruckOwner',
            systemType: 'cattleFeedTruck',
        };
        const response = await usersAPI.createUser(ownerData);
        return response.success ? response.data : null;
    } catch (error) {
        console.error('Error creating cattle feed truck owner:', error);
        throw error;
    }
};

export const updateCattleFeedTruckOwner = async (id, updates) => {
    try {
        const response = await usersAPI.updateUser(id, updates);
        return response.success ? response.data : null;
    } catch (error) {
        console.error('Error updating cattle feed truck owner:', error);
        throw error;
    }
};

export const deleteCattleFeedTruckOwner = async (id) => {
    try {
        const response = await usersAPI.deleteUser(id);
        return response.success;
    } catch (error) {
        console.error('Error deleting cattle feed truck owner:', error);
        throw error;
    }
};

export const getCattleFeedTruckOwner = async (id) => {
    try {
        const response = await usersAPI.getUser(id);
        return response.success ? response.data : null;
    } catch (error) {
        console.error('Error fetching cattle feed truck owner:', error);
        return null;
    }
};
