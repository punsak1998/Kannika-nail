import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyC7N2N_yj6iViZrd83l8Dt6-N82IpOcKwA",
  authDomain: "nail-salon-booking-dfb18.firebaseapp.com",
  projectId: "nail-salon-booking-dfb18",
  storageBucket: "nail-salon-booking-dfb18.firebasestorage.app",
  messagingSenderId: "925022754257",
  appId: "1:925022754257:web:ef79b114c812845319fcf0",
  measurementId: "G-5QTR4JF0PE"
};

// ตรวจสอบว่ามีการสร้างแอป Firebase แล้วหรือยัง เพื่อป้องกันการสร้างซ้ำ
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// กำหนดตัวแปรสำหรับเข้าถึงฐานข้อมูล Firestore
const db = getFirestore(app);

export { db };
export const auth = getAuth(app);