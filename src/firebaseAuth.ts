// Web/TypeScript fallback. Native has a platform-specific implementation.
import {FirebaseApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
export const makeAuth=(app:FirebaseApp)=>getAuth(app);
