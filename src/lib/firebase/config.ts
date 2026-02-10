// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  projectId: "studio-5170547963-be9ad",
  appId: "1:486787755882:web:422762397b8e4ab390ff13",
  apiKey: "AIzaSyDFzBFfkZKJe9B5eUexooStY3OUQkOoxFY",
  authDomain: "studio-5170547963-be9ad.firebaseapp.com",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
