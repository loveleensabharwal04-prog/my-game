// This is a crucial step to enable online play.
// 1. Go to https://console.firebase.google.com/ and create a new project.
// 2. In your project, go to Project Settings (gear icon) -> General tab.
// 3. Scroll down to "Your apps" and click the web icon (</>).
// 4. Register your app (you can just give it a nickname).
// 5. Firebase will give you a `firebaseConfig` object. Copy it and paste it here.
// 6. In the Firebase console, go to Build -> Realtime Database.
// 7. Create a database and, for now, start it in "test mode".

const firebaseConfig = {
  apiKey: "AIzaSyCMVUVqsSYozf7eAC8p0Lh67t4Hbvvv6B8",
  authDomain: "compatibility-challenge.firebaseapp.com",
  databaseURL: "https://compatibility-challenge-default-rtdb.firebaseio.com",
  projectId: "compatibility-challenge",
  storageBucket: "compatibility-challenge.firebasestorage.app",
  messagingSenderId: "846992646826",
  appId: "1:846992646826:web:b7411b7236c7e7d6a1e6d3",
  measurementId: "G-WMYQW7VRS7"
};

let db: any = null;
let firebaseInitialized = false;

// Check if the config object has the necessary keys before initializing
// @ts-ignore
if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.databaseURL) {
  try {
    // @ts-ignore
    const app = firebase.initializeApp(firebaseConfig);
    // @ts-ignore
    db = firebase.database();
    firebaseInitialized = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    firebaseInitialized = false;
  }
}

export { db, firebaseInitialized };