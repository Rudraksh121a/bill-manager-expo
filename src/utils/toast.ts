import { Alert, Platform } from 'react-native';

export interface ToastOptions {
  duration?: number;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export const Toast = {
  show: (message: string, options: ToastOptions = {}) => {
    const { type = 'info' } = options;
    
    // For now, we'll use console.log for success/info and Alert only for errors
    // In a real app, you might want to use a proper toast library
    if (type === 'error') {
      Alert.alert('Error', message);
    } else if (type === 'success') {
      console.log('✅ Success:', message);
    } else if (type === 'warning') {
      console.log('⚠️ Warning:', message);
    } else {
      console.log('ℹ️ Info:', message);
    }
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
