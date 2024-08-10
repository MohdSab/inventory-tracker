// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCszqUpswL2-VRLgMsgKgd-EPsceS6xHPI",
  authDomain: "inventory-management-f4bab.firebaseapp.com",
  projectId: "inventory-management-f4bab",
  storageBucket: "inventory-management-f4bab.appspot.com",
  messagingSenderId: "676810093979",
  appId: "1:676810093979:web:7623ecb33e6617c5bddd3e",
  measurementId: "G-NTD54E4NLF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app)

export {firestore}