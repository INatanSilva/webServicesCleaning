import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhWy4_CikfCfl77vl72wrXsaXZJv3DtDU",
  authDomain: "cleandb-1bf99.firebaseapp.com",
  projectId: "cleandb-1bf99",
  storageBucket: "cleandb-1bf99.firebasestorage.app",
  messagingSenderId: "159323297177",
  appId: "1:159323297177:web:7da84b36093ff2783def08",
  measurementId: "G-S904MJBG32"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 