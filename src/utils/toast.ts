import { Alert, Platform } from 'react-native';

export interface ToastOptions {
  duration?: number;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export const Toast = {
  show: (message: string, options: ToastOptions = {}) => {
    const { type = 'info' } = options;
    
    // For production, only show error alerts
    // In a real app, you might want to use a proper toast library
    if (type === 'error') {
      Alert.alert('Error', message);
    }
    // Success, warning, and info messages are silently handled in production
  },
  
  success: (message: string, options: ToastOptions = {}) => {
    Toast.show(message, { ...options, type: 'success' });
  },
  
  error: (message: string, options: ToastOptions = {}) => {
    Toast.show(message, { ...options, type: 'error' });
  },
  
  info: (message: string, options: ToastOptions = {}) => {
    Toast.show(message, { ...options, type: 'info' });
  },
  
  warning: (message: string, options: ToastOptions = {}) => {
    Toast.show(message, { ...options, type: 'warning' });
  }
};
