import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppRoutes from './src/navigation';

export default function App() {
  return (
    <>
      <AppRoutes />
      <StatusBar style="light" />
    </>
  );
}
