'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserData } from '@/lib/types';
import { storageHelper } from '@/lib/utils';

interface UserContextProps {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  clearUserData: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Initialize from localStorage on mount
  useEffect(() => {
    const savedData = storageHelper.get('userData');
    if (savedData) {
      setUserDataState(savedData);
    }
  }, []);
  
  // Update localStorage when userData changes
  const setUserData = (data: UserData | null) => {
    setUserDataState(data);
    if (data) {
      storageHelper.set('userData', data);
    } else {
      storageHelper.remove('userData');
    }
  };
  
  // Clear user data from state and localStorage
  const clearUserData = () => {
    setUserDataState(null);
    storageHelper.remove('userData');
  };
  
  return (
    <UserContext.Provider value={{ 
      userData, 
      setUserData, 
      clearUserData,
      isLoading,
      setIsLoading
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
