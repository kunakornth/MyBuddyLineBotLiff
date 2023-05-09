// src/firebase.js

// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from 'firebase/app';

// import admin from 'firebase-admin';
// import serviceAccount from './mybuddyline-firebase-key.json';
// Add the Firebase products that you want to use
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: 'AIzaSyCDy1dvoNWYfuWBEk7rodHiK-uJlju3D3s',
    authDomain: 'mybuddylineliff.firebaseapp.com',
    projectId: 'mybuddylineliff',
    storageBucket: 'mybuddylineliff.appspot.com',
    messagingSenderId: '762426172903',
    appId: '1:762426172903:web:7aff0e08f70ec0cc310942',
    measurementId: 'G-HV2PKH9V48'
};
// 

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const auth = getAuth();
export function signIn(email, password) {
    let resp = signInWithEmailAndPassword(auth, email, password);
    return resp;
}

export function signInAnonymous() {
    let resp = signInAnonymously(auth);
    return resp;
}


export const db = getFirestore();
