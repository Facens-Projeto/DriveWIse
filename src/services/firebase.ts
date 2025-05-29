import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC2G-EwWA08QEx-iaMGr8WpUhdml9jVZqE",
  authDomain: "drivewise-97728.firebaseapp.com",
  projectId: "drivewise-97728",
  storageBucket: "drivewise-97728.appspot.com",
  messagingSenderId: "534438045543",
  appId: "1:534438045543:web:9dd07ea99f33d34d5571c2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const API_KEY = firebaseConfig.apiKey;


interface IdentityResponse {
  idToken: string;        
  refreshToken: string;   
  expiresIn: string;      
  localId: string;        
}


export async function signUp(email: string, password: string): Promise<IdentityResponse> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Erro no cadastro');
  }
  await AsyncStorage.multiSet([
    ['@idToken', data.idToken],
    ['@refreshToken', data.refreshToken],
    ['@userId', data.localId],
  ]);
  return data;
}
export async function signIn(email: string, password: string): Promise<IdentityResponse> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Erro no login');
  }

  await AsyncStorage.multiSet([
    ['@idToken', data.idToken],
    ['@refreshToken', data.refreshToken],
    ['@userId', data.localId],
  ]);
  return data;
}

export async function signOut(): Promise<void> {
  await AsyncStorage.multiRemove(['@idToken', '@refreshToken', '@userId']);
}


export async function getIdToken(): Promise<string | null> {
  return await AsyncStorage.getItem('@idToken');
}

export async function getUserId(): Promise<string | null> {
  return await AsyncStorage.getItem('@userId');
}
