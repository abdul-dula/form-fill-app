import { initializeApp } from "firebase/app";
//import { getAuth } from "firebase/auth";
import { getFirestore ,onSnapshot ,collection, doc} from "firebase/firestore";
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyCxtLg-J3YP5TROFaXYcwr4sBjVNO_bcZ4",
  authDomain: "form-fill-firebase.firebaseapp.com",
  projectId: "form-fill-firebase",
  storageBucket: "form-fill-firebase.appspot.com",
  messagingSenderId: "657737876647",
  appId: "1:657737876647:web:23c94eace4cec9ab774782",
  measurementId: "G-GY6GJMVJLG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//export const auth = getAuth(app)

export const db = getFirestore(app);

