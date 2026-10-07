import { FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// React Native's Firebase export is present at runtime but can be absent from
// the web-oriented package declarations in some Firebase SDK versions.
// @ts-expect-error React Native-specific export
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function makeAuth(app: FirebaseApp) {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (error) {
    if ((error as { code?: string }).code === 'auth/already-initialized') {
      return getAuth(app);
    }
    throw error;
  }
}
