// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCegMDsX3kgyJaaLw0jVWwOwSpgW-uhGGg",
  authDomain: "web-chat-a131a.firebaseapp.com",
  projectId: "web-chat-a131a",
  storageBucket: "web-chat-a131a.firebasestorage.app",
  messagingSenderId: "596740127289",
  appId: "1:596740127289:web:c304339edc792899a72be8",
  measurementId: "G-9KYKSK00HS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Analytics (optional)
const analytics = getAnalytics(app);

// Firestore instance used across the app
import { getFirestore } from 'firebase/firestore'


// Auth (anonymous)
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'

export const db = getFirestore(app)

export const auth = getAuth(app)

// Subscribe to auth state changes
export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, (u) => callback(u))
}


let lastAuthError = null

export function getLastAuthError() {
  return lastAuthError
}

// Ensure a signed-in anonymous user exists
export async function ensureAnonymousUser() {
  const current = auth.currentUser
  if (current) return current

  lastAuthError = null

  try {
    // If anonymous auth is disabled / forbidden by Firebase, this will throw
    // auth/admin-restricted-operation.
    const res = await signInAnonymously(auth)
    return res.user
  } catch (err) {
    const code = err?.code

    console.error('[firebase][auth] signInAnonymously failed', {
      code: err?.code,
      message: err?.message,
      name: err?.name,
      stack: err?.stack,
    })

    // Provide a clearer, actionable message for the UI.
    if (code === 'auth/admin-restricted-operation') {
      lastAuthError = {
        code,
        message:
          'Anonymous Auth is disabled for this Firebase project. Enable Anonymous provider in Firebase Console (Authentication → Sign-in method → Anonymous).'
      }
    } else {
      lastAuthError = {
        code,
        message: err?.message || 'Anonymous sign-in failed.'
      }
    }

    // Fallback: allow the app to continue without a user.
    // UI will disable create/send features.
    return null
  }
}




