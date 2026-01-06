/**
 * My Mobile Trainer - Main App Entry Point
 *
 * Initializes Redux store, theme provider, and navigation.
 */

import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { store } from './src/store/store';
import MainNavigator from './src/navigation/MainNavigator';

// Custom theme based on design system from plans
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB', // Energy Blue
    secondary: '#10B981', // Success Green
    tertiary: '#8B5CF6', // Motivation Purple
    error: '#EF4444',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#3B82F6',
    secondary: '#10B981',
    tertiary: '#8B5CF6',
    error: '#EF4444',
  },
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={lightTheme}>
          <MainNavigator />
          <StatusBar style="auto" />
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
