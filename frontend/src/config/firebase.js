import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6_cS23BDwkjd2tyDfyf2MwR2dUrr5dD8",
  authDomain: "ledger-6c645.firebaseapp.com",
  projectId: "ledger-6c645",
  storageBucket: "ledger-6c645.firebasestorage.app",
  messagingSenderId: "446824073830",
  appId: "1:446824073830:web:d57448109410d009a9bba7",
  measurementId: "G-MP00NSV140"
}

// Initialize Firebase - avoid duplicate initialization during HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export default app
