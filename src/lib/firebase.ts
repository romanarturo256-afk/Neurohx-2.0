import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with experimentalForceLongPolling to improve reliability in iFrames
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId);

/**
 * Interface for detailed Firestore errors
 */
export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

/**
 * Handles Firestore errors by throwing a structured JSON string
 */
export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  if (error?.code === 'permission-denied') {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: user?.uid || 'anonymous',
        email: user?.email || 'N/A',
        emailVerified: user?.emailVerified || false,
        isAnonymous: user ? user.isAnonymous : true,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || 'N/A',
          email: p.email || 'N/A'
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}

// Test connection as per critical instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    const errorMsg = error?.message || String(error || '');
    if (errorMsg.includes('permission-denied')) {
      // Silently ignore permission denied for test collection
      return;
    }
    if (errorMsg.includes('the client is offline') || errorMsg.includes('unavailable')) {
      console.warn("Please check your Firebase configuration. The client is reporting as offline or connection is unavailable.");
    } else {
      console.warn("Initial connection test warning:", errorMsg);
    }
  }
}

testConnection().catch(err => {
  console.warn("Initial Firestore connection test failed. This is expected if the user is offline or Firebase is not fully configured.", err);
});
