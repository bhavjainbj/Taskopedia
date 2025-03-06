// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyB95Uzt-RcH1h4ZE0_23yE3njRiGWI6w5o',
	authDomain: 'fir-auth-44228.firebaseapp.com',
	projectId: 'fir-auth-44228',
	storageBucket: 'fir-auth-44228.appspot.com',
	messagingSenderId: '280386256313',
	appId: '1:280386256313:web:ddb3009f2504e4bf9d0a68',
	measurementId: 'G-9VFRB1NF40'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
