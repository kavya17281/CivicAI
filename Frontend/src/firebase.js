import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCg1PUelc9tFY1unOXbCEZnJk25H-ed8nA",
    authDomain: "civic0.firebaseapp.com",
    projectId: "civic0",
    appId: "1:624776391510:web:4bf7e2f13406353bd604f7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);