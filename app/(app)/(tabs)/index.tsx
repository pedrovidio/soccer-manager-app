import React from 'react';
import HomeScreen from '../../../src/features/home/HomeScreen';
import { useAuthStore } from '../../../src/features/auth/useAuthStore';

export default function Page() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  if (!isAuthenticated) return null;
  
  return <HomeScreen />;
}
