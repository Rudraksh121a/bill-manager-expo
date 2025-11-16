import { Alert } from 'react-native';

interface DoubleConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export const showDoubleConfirmation = ({
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: DoubleConfirmationOptions) => {
  // First confirmation
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        onPress: onCancel,
        style: 'cancel',
      },
      {
        text: confirmText,
        onPress: () => {
          // Second confirmation
          Alert.alert(
            'Final Confirmation',
            'This action cannot be undone. Are you absolutely sure?',
            [
              {
                text: 'No, Keep It',
                onPress: onCancel,
                style: 'cancel',
              },
              {
                text: 'Yes, Delete Permanently',
                onPress: onConfirm,
                style: 'destructive',
              },
            ]
          );
        },
        style: 'destructive',
      },
    ]
  );
};
