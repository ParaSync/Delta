import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from '../../firebase-client-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export { signInWithEmailAndPassword, signOut, onAuthStateChanged };

export const route = (s: string) =>
  import.meta.env.DEV ? `http://localhost:3000${s}` : `http://api.dev.delta.neuron.com.ph${s}`;
