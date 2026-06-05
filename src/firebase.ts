import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App using the environment's provisioned config
const app = initializeApp(firebaseConfig);

// Explicitly initialize Firestore using the specific database ID or default instance
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

// Metadata catalog of known existing collections in the Zaria database schema
export const VALID_COLLECTIONS = [
  'config',
  'categories',
  'collections',
  'products',
  'orders',
  'points_of_sale',
  'reviews',
  'activity_logs',
  'admins',
  'promos',
  'page_content',
  'callbacks',
  'drivers',
  'reservations',
  'users'
];

/**
 * Validates whether a given Firestore collection/table exists in the system schema,
 * preventing 'Could not find the table' cache errors, missing definitions, or invalid queries.
 */
export function verifyCollectionExistence(colName: string): boolean {
  if (!VALID_COLLECTIONS.includes(colName)) {
    console.error(`[Firebase Security Guard] Database table/collection '${colName}' is not defined in the schema.`);
    return false;
  }
  return true;
}

