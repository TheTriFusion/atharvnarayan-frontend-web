import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const OwnerContext = createContext(undefined);

export const useOwner = () => {
  const context = useContext(OwnerContext);
  if (!context) {
    console.error('useOwner: Context not found, returning default values');
    // Return default values instead of throwing
    return {
      selectedOwnerId: null,
      selectedOwnerData: null,
      ownerType: 'cattleFeed',
      selectOwner: () => {},
      clearOwner: () => {},
      hasOwnerSelected: false,
    };
  }
  return context;
};

export const OwnerProvider = ({ children }) => {
  const auth = useAuth();
  const isSuperAdmin = auth?.isSuperAdmin || false;
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [selectedOwnerData, setSelectedOwnerData] = useState(null);
  const [ownerType, setOwnerType] = useState('cattleFeed'); // 'cattleFeed' or 'milkTruck'
  const hasLoadedRef = useRef(false);

  // Load selected owner from localStorage - only once
  useEffect(() => {
    if (isSuperAdmin && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      const saved = localStorage.getItem('superadmin_selected_owner');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSelectedOwnerId(parsed.ownerId);
          setSelectedOwnerData(parsed.ownerData);
          setOwnerType(parsed.ownerType || 'cattleFeed');
        } catch (error) {
          console.error('Failed to parse saved owner:', error);
        }
      }
    }
  }, [isSuperAdmin]);

  // Memoize callbacks to prevent re-renders
  const selectOwner = useCallback((ownerId, ownerData, type = 'cattleFeed') => {
    setSelectedOwnerId(ownerId);
    setSelectedOwnerData(ownerData);
    setOwnerType(type);
    
    if (ownerId && ownerData) {
      localStorage.setItem(
        'superadmin_selected_owner',
        JSON.stringify({ ownerId, ownerData, ownerType: type })
      );
    } else {
      localStorage.removeItem('superadmin_selected_owner');
    }
  }, []);

  const clearOwner = useCallback(() => {
    setSelectedOwnerId(null);
    setSelectedOwnerData(null);
    localStorage.removeItem('superadmin_selected_owner');
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    selectedOwnerId,
    selectedOwnerData,
    ownerType,
    selectOwner,
    clearOwner,
    hasOwnerSelected: !!selectedOwnerId,
  }), [selectedOwnerId, selectedOwnerData, ownerType, selectOwner, clearOwner]);

  return <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>;
};

