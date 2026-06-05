import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Note: AI studio environment requires default db initialization or matching databaseId, wait, the App uses firebaseConfig.firestoreDatabaseId

async function test() {
  try {
    const snpe = await getDocs(collection(db, 'config'));
    console.log("Config size:", snpe.size);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
