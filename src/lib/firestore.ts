import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {

    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

console.log('test',app.options.apiKey)


// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);


export interface CluegenGame {
    id: string;
    code: string;
    prompt: string;
    createdAt: Date;
    updatedAt: Date;
    users: User[];
    host: string;
    gameTime: number;
    isTimerDone: boolean;
    messages: ChatMessage[];
    imageUrl: string;
    gameStarted: boolean;

}

interface User{
    id: string;
    name: string;
    score: number;
}

interface ChatMessage {
    id: string;
    content: string;
    sender: string;
    isCorrect: boolean;
}


