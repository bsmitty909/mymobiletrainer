/**
 * My Mobile Trainer - Main App Entry Point
 *
 * Initializes Redux store, theme provider, and navigation.
 */

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useSelector } from 'react-redux';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { store, RootState } from './src/store/store';
import MainNavigator from './src/navigation/MainNavigator';
import OfflineSyncService from './src/services/OfflineSyncService';

// Modern 2024 Design System Theme
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0066FF',
    secondary: '#00C853',
    tertiary: '#FF9100',
    error: '#FF3B30',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceVariant: '#FFFFFF',
    outline: '#E5E7EB',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#1A1A1A',
    onSurfaceVariant: '#6B7280',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#0066FF',
    secondary: '#00C853',
    tertiary: '#FF9100',
    error: '#FF3B30',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceVariant: '#2A2A2A',
    outline: '#2A2A2A',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#A1A1A1',
  },
};

function AppContent() {
  const themeMode = useSelector((state: RootState) => state.ui.theme);
  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={currentTheme}>
      <MainNavigator />
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
    </PaperProvider>
  );
}

export default function App() {
  useEffect(() => {
    OfflineSyncService.initialize();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
