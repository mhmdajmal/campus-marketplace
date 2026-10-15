import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { makeAuth } from './firebaseAuth';

const cfg = {
  apiKey:process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
export const firebaseReady = Boolean(cfg.apiKey && cfg.projectId && cfg.appId && cfg.apiKey !== 'replace_me' && cfg.projectId !== 'replace_me');
let firebaseApp: FirebaseApp | null = null;
let authService: Auth | null = null;
let dbService: Firestore | null = null;
if(firebaseReady){
  firebaseApp = getApps().length ? getApp() : initializeApp(cfg);
  authService = makeAuth(firebaseApp);
  dbService=getFirestore(firebaseApp);
}
export const auth=authService;
export const db=dbService;
