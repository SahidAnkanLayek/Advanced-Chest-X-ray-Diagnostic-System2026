import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7vok-fS5zFfPWG8TRCdusI2tQzrFNJ3g",
  authDomain: "chestscan-ai-advisor26.firebaseapp.com",
  projectId: "chestscan-ai-advisor26",
  storageBucket: "chestscan-ai-advisor26.appspot.com",
  messagingSenderId: "499392773956",
  appId: "1:499392773956:web:bf5b98de9fe9150313a111"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

