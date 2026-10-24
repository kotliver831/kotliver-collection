import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  getDocsFromServer,
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  limit
} from 'firebase/firestore';
import { 
  getAuth, 
  Auth, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { FirebaseStatusInfo, Product, Category, Banner, Order, SiteSettings } from '../types';
import firebaseAppletConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export interface AdminAuthResult {
  authorized: boolean;
  user?: User;
  email: string;
  isEmailVerified: boolean;
  adminDocExists: boolean;
  firestoreWriteAllowed: boolean;
  error?: string;
  errorCode?: string;
}

const FIREBASE_CONFIG_STORAGE_KEY = 'kc_firebase_user_config_v1';
const LAST_CHECK_KEY = 'kc_firebase_last_check_v1';

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

// Error handler adhering strictly to Firebase skill specification
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const DEFAULT_FIRESTORE_DATABASE_ID = 'ai-studio-kotlivercollecti-e77f1d07-8154-45c3-9ddd-04ef0e64f0fd';

// Retrieve active Firebase configuration (prioritizing provisioned firebase-applet-config.json, then VITE_ env vars, then local storage)
export function getStoredFirebaseConfig(): any | null {
  let cfg: any = null;

  // 1. Check provisioned firebase-applet-config.json
  if (firebaseAppletConfig && firebaseAppletConfig.projectId && firebaseAppletConfig.apiKey) {
    cfg = { ...firebaseAppletConfig };
  } else {
    // 2. Check Vite environment variables (e.g. configured in Netlify site settings)
    const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (envApiKey && envProjectId) {
      cfg = {
        apiKey: envApiKey,
        projectId: envProjectId,
        appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
        firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || DEFAULT_FIRESTORE_DATABASE_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        oAuthClientId: import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID || ''
      };
    } else {
      // 3. Fallback to any user-stored custom configuration
      try {
        const raw = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
        if (raw) {
          cfg = JSON.parse(raw);
        }
      } catch (e) {
        console.error('Error reading stored Firebase configuration:', e);
      }
    }
  }

  if (cfg) {
    if (!cfg.firestoreDatabaseId) {
      cfg.firestoreDatabaseId = DEFAULT_FIRESTORE_DATABASE_ID;
    }
  }

  return cfg;
}

// Save custom Firebase web config (e.g. pasted by admin)
export function saveFirebaseConfig(config: any): void {
  try {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    appInstance = null;
    firestoreInstance = null;
    authInstance = null;
  } catch (e) {
    console.error('Error saving Firebase configuration:', e);
  }
}

// Clear configuration
export function clearFirebaseConfig(): void {
  localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
  appInstance = null;
  firestoreInstance = null;
  authInstance = null;
}

let firebaseInitializationError: string | null = null;

export function getFirebaseInitializationError(): string | null {
  return firebaseInitializationError;
}

// Initialize Firebase with the correct database ID and matching project instance
export function getFirebaseInstances(): { 
  app: FirebaseApp | null; 
  db: Firestore | null; 
  auth: Auth | null;
  error: string | null;
} {
  if (appInstance && firestoreInstance && authInstance) {
    return { app: appInstance, db: firestoreInstance, auth: authInstance, error: null };
  }

  const config = getStoredFirebaseConfig();
  if (!config) {
    firebaseInitializationError = 'Firebase configuration is missing. No config found in firebase-applet-config.json, environment variables, or local storage.';
    return { app: null, db: null, auth: null, error: firebaseInitializationError };
  }

  if (!config.apiKey || !config.projectId) {
    firebaseInitializationError = `Firebase configuration is incomplete. Missing ${!config.apiKey ? 'apiKey ' : ''}${!config.projectId ? 'projectId' : ''}.`;
    return { app: null, db: null, auth: null, error: firebaseInitializationError };
  }

  try {
    firebaseInitializationError = null;

    // Check all initialized Firebase apps in the runtime
    const allApps = getApps();
    const matchingApp = allApps.find(
      (app) => app.options.projectId === config.projectId && app.options.apiKey === config.apiKey
    );

    if (matchingApp) {
      appInstance = matchingApp;
    } else {
      const defaultApp = allApps.find((app) => app.name === '[DEFAULT]');
      if (!defaultApp) {
        // [DEFAULT] app does not exist, initialize it
        appInstance = initializeApp(config);
      } else if (defaultApp.options.projectId === config.projectId && defaultApp.options.apiKey === config.apiKey) {
        // [DEFAULT] app exists and matches our project credentials
        appInstance = defaultApp;
      } else {
        // [DEFAULT] app belongs to another project; initialize a dedicated named app
        const appName = `kotliver-${config.projectId}`;
        const existingNamed = allApps.find((app) => app.name === appName);
        appInstance = existingNamed || initializeApp(config, appName);
      }
    }

    // Pass specific databaseId if provided and not '(default)'
    const targetDatabaseId = config.firestoreDatabaseId;
    if (targetDatabaseId && targetDatabaseId !== '(default)') {
      firestoreInstance = getFirestore(appInstance, targetDatabaseId);
    } else {
      firestoreInstance = getFirestore(appInstance);
    }

    authInstance = getAuth(appInstance);

    return { app: appInstance, db: firestoreInstance, auth: authInstance, error: null };
  } catch (e: any) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    firebaseInitializationError = `Firebase initialization failure: ${errorMsg}`;
    console.error(firebaseInitializationError, e);
    appInstance = null;
    firestoreInstance = null;
    authInstance = null;
    return { app: null, db: null, auth: null, error: firebaseInitializationError };
  }
}

// Export singletons for direct SDK usage
const instances = getFirebaseInstances();
export const db = instances.db;
export const auth = instances.auth;

// Validate connection to Firestore on boot as per Firebase skill
async function testConnection() {
  const { db } = getFirebaseInstances();
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection note: client is offline or network is unreachable.");
    }
  }
}
testConnection();

export const firebaseService = {
  // Check live connection state without exposing secrets
  async checkConnectionStatus(): Promise<FirebaseStatusInfo> {
    const config = getStoredFirebaseConfig();
    const lastCheck = typeof localStorage !== 'undefined' ? (localStorage.getItem(LAST_CHECK_KEY) || null) : null;

    if (!config || !config.apiKey || !config.projectId) {
      return {
        state: 'Not Configured',
        projectId: null,
        authConfigured: false,
        firestoreConfigured: false,
        lastConnectionCheck: lastCheck,
        diagnosticError: 'No Firebase configuration detected. Provide Firebase project credentials to enable cloud persistence.',
        isCurrentUserAdmin: false,
        testDetails: {
          initPassed: false,
          authPassed: false,
          readPassed: false,
          summary: 'No Firebase configuration detected in firebase-applet-config.json or local storage.'
        }
      };
    }

    try {
      const { db, auth, error: initError } = getFirebaseInstances();
      if (!db || !auth) {
        return {
          state: 'Connection Error',
          projectId: config.projectId,
          databaseId: config.firestoreDatabaseId || '(default)',
          authConfigured: false,
          firestoreConfigured: false,
          lastConnectionCheck: lastCheck,
          diagnosticError: initError || 'Firebase SDK failed to initialize with the provided configuration.',
          isCurrentUserAdmin: false,
          testDetails: {
            initPassed: false,
            authPassed: false,
            readPassed: false,
            summary: initError || 'Firebase App or Firestore instance initialization failed.'
          }
        };
      }

      const timestamp = new Date().toISOString();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LAST_CHECK_KEY, timestamp);
      }

      // Verify Authentication State
      const currentUser = auth.currentUser;
      const currentUserEmail = currentUser?.email || null;
      const isOwner = currentUserEmail?.toLowerCase() === 'jamjam8314@gmail.com';
      const isAuthAdmin = isOwner ? await this.verifyAdminRole(currentUser) : false;

      // Perform a direct server read from the products collection on the configured database
      const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      let productsCount = 0;
      let latencyMs = 0;
      let readPassed = false;
      let errorDetails: string | null = null;

      try {
        const pathForGetDocs = 'products';
        const productsCol = collection(db, pathForGetDocs);
        // Use timeout protection (8 seconds) to prevent silent hangs
        const snap = await this._withTimeout(
          getDocsFromServer(query(productsCol, limit(20))),
          8000,
          `Reading "${pathForGetDocs}" from database "${config.firestoreDatabaseId || '(default)'}"`
        );
        productsCount = snap.size;
        readPassed = true;
        const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        latencyMs = Math.round(endTime - startTime);
      } catch (checkErr: any) {
        const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        latencyMs = Math.round(endTime - startTime);
        const msg = checkErr instanceof Error ? checkErr.message : String(checkErr);
        const code = checkErr?.code || '';

        if (code === 'deadline-exceeded' || msg.includes('timed out')) {
          errorDetails = `Connection timed out after 8s while contacting Cloud Firestore database "${config.firestoreDatabaseId}". Check network connectivity.`;
        } else if (msg.includes('offline') || code === 'unavailable') {
          errorDetails = 'Client is offline or Cloud Firestore server endpoint could not be reached.';
        } else if (code === 'permission-denied' || msg.includes('Missing or insufficient permissions')) {
          errorDetails = 'Permission denied reading products collection from Cloud Firestore. Check security rules.';
        } else {
          errorDetails = msg;
        }
      }

      if (readPassed) {
        const authSummary = currentUserEmail
          ? `Signed in as ${currentUserEmail} (${isAuthAdmin ? 'Verified Store Owner' : 'Customer'})`
          : 'Storefront public read active (Admin signed out)';
        return {
          state: 'Connected',
          projectId: config.projectId,
          databaseId: config.firestoreDatabaseId || '(default)',
          authConfigured: true,
          firestoreConfigured: true,
          lastConnectionCheck: timestamp,
          diagnosticError: null,
          currentUserEmail,
          isCurrentUserAdmin: isAuthAdmin,
          testDetails: {
            initPassed: true,
            authPassed: true,
            readPassed: true,
            productsCount,
            latencyMs,
            summary: `Connected to database "${config.firestoreDatabaseId}". Verified live read from "products" collection (${productsCount} items loaded in ${latencyMs}ms). ${authSummary}.`
          }
        };
      } else {
        return {
          state: 'Connection Error',
          projectId: config.projectId,
          databaseId: config.firestoreDatabaseId || '(default)',
          authConfigured: true,
          firestoreConfigured: true,
          lastConnectionCheck: timestamp,
          diagnosticError: errorDetails,
          currentUserEmail,
          isCurrentUserAdmin: isAuthAdmin,
          testDetails: {
            initPassed: true,
            authPassed: true,
            readPassed: false,
            latencyMs,
            summary: errorDetails || 'Failed to read products collection from Cloud Firestore.'
          }
        };
      }
    } catch (e: any) {
      const timestamp = new Date().toISOString();
      const errText = e instanceof Error ? e.message : 'Unknown connection error.';
      return {
        state: 'Connection Error',
        projectId: config.projectId,
        databaseId: config.firestoreDatabaseId || '(default)',
        authConfigured: false,
        firestoreConfigured: false,
        lastConnectionCheck: timestamp,
        diagnosticError: errText,
        isCurrentUserAdmin: false,
        testDetails: {
          initPassed: false,
          authPassed: false,
          readPassed: false,
          summary: errText
        }
      };
    }
  },

  // Unified authorization process for designated owner account (jamjam8314@gmail.com)
  async verifyAdminAuthorization(user: User | null | undefined): Promise<AdminAuthResult> {
    if (!user) {
      return {
        authorized: false,
        email: '',
        isEmailVerified: false,
        adminDocExists: false,
        firestoreWriteAllowed: false,
        error: 'No authenticated Firebase user found. Please log in.',
        errorCode: 'auth/no-current-user'
      };
    }

    const expectedOwnerEmail = 'jamjam8314@gmail.com';
    const userEmail = (user.email || '').toLowerCase().trim();

    // 1. Strict identity verification: Must match designated store owner
    if (userEmail !== expectedOwnerEmail) {
      return {
        authorized: false,
        user,
        email: userEmail,
        isEmailVerified: !!user.emailVerified,
        adminDocExists: false,
        firestoreWriteAllowed: false,
        error: `Access Denied: Account "${user.email}" is not authorized. Only the designated store owner (${expectedOwnerEmail}) has administrative privileges.`,
        errorCode: 'auth/unauthorized-account'
      };
    }

    const { db, error: initError } = getFirebaseInstances();
    if (!db) {
      return {
        authorized: false,
        user,
        email: userEmail,
        isEmailVerified: !!user.emailVerified,
        adminDocExists: false,
        firestoreWriteAllowed: false,
        error: initError || 'Cloud Firestore database is not initialized. Please verify your Firebase project configuration.',
        errorCode: 'auth/database-unavailable'
      };
    }

    // 2. Check admin document in Cloud Firestore /admins/{uid}
    try {
      const adminDoc = await getDocFromServer(doc(db, 'admins', user.uid));
      
      if (adminDoc.exists()) {
        const data = adminDoc.data();
        if (
          data &&
          typeof data.email === 'string' &&
          data.email.toLowerCase() === expectedOwnerEmail &&
          data.role === 'superadmin'
        ) {
          return {
            authorized: true,
            user,
            email: userEmail,
            isEmailVerified: !!user.emailVerified,
            adminDocExists: true,
            firestoreWriteAllowed: !!user.emailVerified
          };
        }
        return {
          authorized: false,
          user,
          email: userEmail,
          isEmailVerified: !!user.emailVerified,
          adminDocExists: true,
          firestoreWriteAllowed: false,
          error: `Access Denied: Firestore admin record found for "${userEmail}", but role is not "superadmin".`,
          errorCode: 'auth/insufficient-admin-role'
        };
      }

      // 3. Document does not exist in /admins/{uid}
      // If the owner has a verified email, perform the authorized least-privilege bootstrap create
      if (user.emailVerified) {
        const timestamp = new Date().toISOString();
        try {
          await setDoc(doc(db, 'admins', user.uid), {
            email: expectedOwnerEmail,
            role: 'superadmin',
            createdAt: timestamp,
            updatedAt: timestamp
          });

          return {
            authorized: true,
            user,
            email: userEmail,
            isEmailVerified: true,
            adminDocExists: true,
            firestoreWriteAllowed: true
          };
        } catch (bootstrapErr: any) {
          const errCode = bootstrapErr?.code || 'permission-denied';
          const errMsg = bootstrapErr?.message || 'Permission denied';
          console.error('Firestore admin bootstrap write failed:', bootstrapErr);
          return {
            authorized: false,
            user,
            email: userEmail,
            isEmailVerified: true,
            adminDocExists: false,
            firestoreWriteAllowed: false,
            error: `Firestore security rules denied admin bootstrap write: ${errMsg}.`,
            errorCode: errCode
          };
        }
      }

      // If email is not yet verified:
      // Per Requirement 6: Do not require email verification for dashboard access unless intended security policy explicitly requires it.
      // But we do NOT write to Firestore (as rules reject unverified writes) and mark firestoreWriteAllowed as false.
      return {
        authorized: true,
        user,
        email: userEmail,
        isEmailVerified: false,
        adminDocExists: false,
        firestoreWriteAllowed: false
      };
    } catch (readErr: any) {
      const errCode = readErr?.code || 'firestore/error';
      const errMsg = readErr?.message || String(readErr);
      console.error('Firestore admin verification read error:', readErr);

      // Do NOT grant admin access when Firestore read returns permission-denied
      return {
        authorized: false,
        user,
        email: userEmail,
        isEmailVerified: !!user.emailVerified,
        adminDocExists: false,
        firestoreWriteAllowed: false,
        error: `Permission error verifying admin role in Cloud Firestore: ${errMsg}`,
        errorCode: errCode
      };
    }
  },

  // Legacy boolean check
  async verifyAdminRole(user: User | null | undefined): Promise<boolean> {
    const result = await this.verifyAdminAuthorization(user);
    return result.authorized;
  },

  // Email & Password Authentication
  async signInWithEmail(email: string, password: string): Promise<AdminAuthResult> {
    const { auth, error: initError } = getFirebaseInstances();
    if (!auth) {
      const err: any = new Error(initError || 'Firebase Authentication is not configured or failed to initialize.');
      err.code = 'auth/not-initialized';
      throw err;
    }

    const trimmedEmail = (email || '').trim();
    if (!trimmedEmail) {
      const err: any = new Error('Please enter your admin email address.');
      err.code = 'auth/missing-email';
      throw err;
    }
    if (!password) {
      const err: any = new Error('Please enter your admin password.');
      err.code = 'auth/missing-password';
      throw err;
    }

    const expectedOwnerEmail = 'jamjam8314@gmail.com';
    if (trimmedEmail.toLowerCase() !== expectedOwnerEmail) {
      const err: any = new Error(`Access Denied: Account "${trimmedEmail}" is not authorized. Only the store owner (${expectedOwnerEmail}) is permitted to manage this store.`);
      err.code = 'auth/unauthorized-account';
      throw err;
    }

    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    const user = userCredential.user;

    const authResult = await this.verifyAdminAuthorization(user);
    if (!authResult.authorized) {
      await this.signOut();
      const err: any = new Error(authResult.error || `Access Denied: Account ${user.email} is not authorized.`);
      err.code = authResult.errorCode || 'auth/unauthorized-account';
      throw err;
    }

    return authResult;
  },

  // Send verification email to current user
  async sendVerificationEmail(): Promise<void> {
    const { auth } = getFirebaseInstances();
    if (!auth?.currentUser) {
      throw new Error('No user is currently signed in to send verification email.');
    }
    await sendEmailVerification(auth.currentUser);
  },

  // Send password reset email
  async sendPasswordReset(email?: string): Promise<void> {
    const { auth } = getFirebaseInstances();
    if (!auth) {
      throw new Error('Firebase Authentication is not initialized.');
    }
    const targetEmail = (email || '').trim() || 'jamjam8314@gmail.com';
    await sendPasswordResetEmail(auth, targetEmail);
  },

  // Reload current user to refresh emailVerified status
  async reloadCurrentUser(): Promise<User | null> {
    const { auth } = getFirebaseInstances();
    if (auth?.currentUser) {
      await auth.currentUser.reload();
      return auth.currentUser;
    }
    return null;
  },

  // Google Popup Authentication
  async signInWithGoogle(): Promise<AdminAuthResult> {
    const { auth, error: initError } = getFirebaseInstances();
    if (!auth) {
      const err: any = new Error(initError || 'Firebase Authentication is not configured yet.');
      err.code = 'auth/not-initialized';
      throw err;
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    
    if (!result.user) {
      const err: any = new Error('Google sign-in was cancelled before completion.');
      err.code = 'auth/popup-closed-by-user';
      throw err;
    }

    const authResult = await this.verifyAdminAuthorization(result.user);
    if (!authResult.authorized) {
      await this.signOut();
      const err: any = new Error(authResult.error || `Access Denied: Account ${result.user.email} is not authorized.`);
      err.code = authResult.errorCode || 'auth/unauthorized-account';
      throw err;
    }

    return authResult;
  },

  // Sign out
  async signOut(): Promise<void> {
    const { auth } = getFirebaseInstances();
    if (auth) {
      await firebaseSignOut(auth);
    }
  },

  // Helper to ensure payloads contain no undefined values (which Firestore rejects)
  _sanitizeDoc<T extends Record<string, any>>(data: T): Record<string, any> {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (val === undefined) continue;
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = this._sanitizeDoc(val);
      } else {
        clean[key] = val;
      }
    }
    return clean;
  },

  // Helper to run Firestore operations with a fail-safe timeout to prevent hanging UI
  async _withTimeout<T>(promise: Promise<T>, timeoutMs = 9000, operationDesc = 'Cloud Firestore operation'): Promise<T> {
    let timer: any;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timer = setTimeout(() => {
        const err: any = new Error(`${operationDesc} timed out after ${timeoutMs / 1000}s. Please check your network connection.`);
        err.code = 'deadline-exceeded';
        reject(err);
      }, timeoutMs);
    });
    try {
      const res = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timer);
      return res;
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  },

  // Sync a single Product to Firestore with confirmed write
  async persistProduct(product: Product): Promise<{ success: boolean; firestoreUpdated: boolean; error?: string }> {
    const { db, auth } = getFirebaseInstances();
    if (!db) {
      return { success: false, firestoreUpdated: false, error: 'Cloud Firestore is not initialized. Please verify configuration.' };
    }
    
    const currentUser = auth?.currentUser;
    if (!currentUser || currentUser.email?.toLowerCase() !== 'jamjam8314@gmail.com') {
      return { 
        success: false, 
        firestoreUpdated: false, 
        error: 'Authentication required. Please sign in as the authorized store owner (jamjam8314@gmail.com) to save to Cloud Firestore.' 
      };
    }

    if (!product.id || !product.name?.trim()) {
      return {
        success: false,
        firestoreUpdated: false,
        error: 'Validation failed: Product ID and title are required.'
      };
    }

    try {
      const sanitized = this._sanitizeDoc(product);
      await this._withTimeout(
        setDoc(doc(db, 'products', product.id), sanitized),
        9000,
        `Saving product "${product.name}"`
      );
      return { success: true, firestoreUpdated: true };
    } catch (error: any) {
      console.error('Firestore product persist error:', error);
      const code = error?.code || '';
      const msg = error?.message || 'Firestore write error';
      let friendlyError = msg;
      if (code === 'permission-denied') {
        friendlyError = 'Permission Denied: Cloud Firestore security rules rejected saving this product. Ensure you are signed in as jamjam8314@gmail.com.';
      } else if (code === 'deadline-exceeded' || msg.includes('timed out')) {
        friendlyError = 'Network Timeout: Cloud Firestore did not respond within 9 seconds. The operation was aborted to prevent freezing.';
      } else if (code === 'unavailable' || msg.includes('offline')) {
        friendlyError = 'Network Offline: Cloud Firestore is unreachable. Please verify your connection.';
      }
      return { success: false, firestoreUpdated: false, error: friendlyError };
    }
  },

  // Delete product from Firestore with confirmed deletion
  async deleteProduct(productId: string): Promise<{ success: boolean; firestoreUpdated: boolean; error?: string }> {
    const { db, auth } = getFirebaseInstances();
    if (!db) {
      return { success: false, firestoreUpdated: false, error: 'Cloud Firestore is not initialized.' };
    }

    const currentUser = auth?.currentUser;
    if (!currentUser || currentUser.email?.toLowerCase() !== 'jamjam8314@gmail.com') {
      return { 
        success: false, 
        firestoreUpdated: false, 
        error: 'Authentication required. Please sign in as the authorized store owner (jamjam8314@gmail.com) to delete from Cloud Firestore.' 
      };
    }

    if (!productId?.trim()) {
      return {
        success: false,
        firestoreUpdated: false,
        error: 'Invalid product ID for deletion.'
      };
    }

    try {
      await this._withTimeout(
        deleteDoc(doc(db, 'products', productId)),
        9000,
        `Deleting product "${productId}"`
      );
      return { success: true, firestoreUpdated: true };
    } catch (error: any) {
      console.error('Firestore product delete error:', error);
      const code = error?.code || '';
      const msg = error?.message || 'Firestore delete error';
      let friendlyError = msg;
      if (code === 'permission-denied') {
        friendlyError = 'Permission Denied: Cloud Firestore security rules rejected deleting this product. Ensure you are signed in as jamjam8314@gmail.com.';
      } else if (code === 'deadline-exceeded' || msg.includes('timed out')) {
        friendlyError = 'Network Timeout: Cloud Firestore did not respond within 9 seconds. Operation cancelled to avoid hanging.';
      } else if (code === 'unavailable' || msg.includes('offline')) {
        friendlyError = 'Network Offline: Cloud Firestore is unreachable. Please verify your connection.';
      }
      return { success: false, firestoreUpdated: false, error: friendlyError };
    }
  },

  // Persist order to Firestore
  async persistOrder(order: Order): Promise<void> {
    const { db } = getFirebaseInstances();
    if (!db) return;
    const path = `orders/${order.id}`;
    try {
      await setDoc(doc(db, 'orders', order.id), order);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Persist settings to Firestore
  async persistSettings(settings: SiteSettings): Promise<void> {
    const { db, auth } = getFirebaseInstances();
    if (!db) return;
    if (!auth?.currentUser) return;

    const path = 'settings/general';
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
    } catch (error: any) {
      if (
        error?.code === 'permission-denied' ||
        (error?.message && error.message.toLowerCase().includes('permission'))
      ) {
        console.warn('Firestore settings sync deferred: permissions pending.');
        return;
      }
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Persist banner to Firestore
  async persistBanner(banner: Banner): Promise<void> {
    const { db, auth } = getFirebaseInstances();
    if (!db) return;
    if (!auth?.currentUser) return;

    const path = `banners/${banner.id}`;
    try {
      await setDoc(doc(db, 'banners', banner.id), banner);
    } catch (error: any) {
      if (
        error?.code === 'permission-denied' ||
        (error?.message && error.message.toLowerCase().includes('permission'))
      ) {
        console.warn(`Firestore banner sync deferred (${banner.id}): permissions pending.`);
        return;
      }
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Fetch all products from Firestore with smart cross-database fallback
  async loadProductsFromFirestore(): Promise<Product[] | null> {
    const { db, app } = getFirebaseInstances();
    if (!db) return null;
    const path = 'products';
    try {
      const snap = await this._withTimeout(getDocs(collection(db, path)), 7000, 'Loading products');
      if (snap && snap.size > 0) {
        return snap.docs.map((d) => ({ ...(d.data() as Product), id: d.id || (d.data() as any).id }));
      }

      // If primary configured database returned 0 docs, check alternate database (e.g. (default))
      if (app) {
        try {
          const config = getStoredFirebaseConfig();
          const targetDbId = config?.firestoreDatabaseId;
          const alternateDb = targetDbId && targetDbId !== '(default)'
            ? getFirestore(app)
            : getFirestore(app, DEFAULT_FIRESTORE_DATABASE_ID);

          const altSnap = await this._withTimeout(getDocs(collection(alternateDb, path)), 7000, 'Loading products from alternate db');
          if (altSnap && altSnap.size > 0) {
            console.log(`[Firestore] Loaded ${altSnap.size} live products from alternate database.`);
            return altSnap.docs.map((d) => ({ ...(d.data() as Product), id: d.id || (d.data() as any).id }));
          }
        } catch (e: any) {
          console.warn('[Firestore] Alternate database query notice:', e?.message);
        }
      }

      return [];
    } catch (error: any) {
      console.warn('Firestore load products note:', error?.message);
      if (app) {
        try {
          const altDb = getFirestore(app);
          const altSnap = await getDocs(collection(altDb, path));
          if (altSnap && altSnap.size > 0) {
            return altSnap.docs.map((d) => ({ ...(d.data() as Product), id: d.id || (d.data() as any).id }));
          }
        } catch {}
      }
      return null;
    }
  },

  // Real-time synchronization listener for products from Cloud Firestore with multi-database resilience
  subscribeToProducts(
    onSuccess: (products: Product[]) => void,
    onError?: (err: any) => void
  ): () => void {
    const { db, app } = getFirebaseInstances();
    if (!db) {
      if (onError) onError(new Error('Cloud Firestore is not initialized.'));
      return () => {};
    }
    const path = 'products';
    let isCancelled = false;
    let unsubCurrent: (() => void) | null = null;

    const attach = (targetDb: Firestore, isAlternate = false) => {
      try {
        const colRef = collection(targetDb, path);
        const unsub = onSnapshot(
          colRef,
          (snapshot) => {
            if (isCancelled) return;
            const prods: Product[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Product;
              if (data && (data.id || docSnap.id)) {
                prods.push({ ...data, id: data.id || docSnap.id });
              }
            });

            // If active targetDb has 0 docs, and we haven't tried alternate db, check alternate
            if (prods.length === 0 && !isAlternate && app) {
              const config = getStoredFirebaseConfig();
              const altDb = (config?.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)')
                ? getFirestore(app)
                : getFirestore(app, DEFAULT_FIRESTORE_DATABASE_ID);

              getDocs(collection(altDb, path)).then((altSnap) => {
                if (altSnap && altSnap.size > 0 && !isCancelled) {
                  if (unsubCurrent) unsubCurrent();
                  unsubCurrent = attach(altDb, true);
                } else if (!isCancelled) {
                  onSuccess(prods);
                }
              }).catch(() => {
                if (!isCancelled) onSuccess(prods);
              });
              return;
            }

            onSuccess(prods);
          },
          (error) => {
            console.warn('Firestore products onSnapshot notice:', error?.message);
            if (!isAlternate && app && !isCancelled) {
              try {
                const altDb = getFirestore(app);
                if (unsubCurrent) unsubCurrent();
                unsubCurrent = attach(altDb, true);
                return;
              } catch {}
            }
            if (onError) onError(error);
          }
        );
        return unsub;
      } catch (err: any) {
        console.warn('Failed to attach Firestore snapshot listener:', err);
        if (onError) onError(err);
        return () => {};
      }
    };

    unsubCurrent = attach(db, false);

    return () => {
      isCancelled = true;
      if (unsubCurrent) unsubCurrent();
    };
  },

  // Sync entire store catalog & settings to Cloud Firestore
  async syncAllToFirestore(data: {
    products: Product[];
    categories: Category[];
    banners: Banner[];
    settings: SiteSettings;
  }): Promise<{ success: boolean; count: number; error?: string }> {
    const { db, auth } = getFirebaseInstances();
    if (!db) return { success: false, count: 0, error: 'Cloud Firestore is not initialized.' };

    const currentUser = auth?.currentUser;
    if (!currentUser) {
      return { 
        success: false, 
        count: 0, 
        error: 'No active Firebase Auth session detected. Please sign in with the authorized store owner account (jamjam8314@gmail.com) first to authorize Cloud Firestore writes.' 
      };
    }

    // Refresh auth ID token to guarantee valid, active credentials for Firestore security rules
    try {
      await currentUser.getIdToken(true);
    } catch (tokenErr: any) {
      console.warn('Firebase Auth token refresh note:', tokenErr?.message);
    }

    let count = 0;
    try {
      // 1. Sync Products
      for (const p of data.products) {
        const cleanProduct = this._sanitizeDoc(p);
        try {
          await this._withTimeout(
            setDoc(doc(db, 'products', p.id), cleanProduct, { merge: true }),
            8000,
            `Syncing product ${p.name || p.id}`
          );
          count++;
        } catch (itemErr: any) {
          throw new Error(`Write failed on collection "products", document "${p.id}": ${itemErr.message}`);
        }
      }

      // 2. Sync Categories
      for (const c of (data.categories || [])) {
        const cleanCategory = this._sanitizeDoc(c);
        try {
          await this._withTimeout(
            setDoc(doc(db, 'categories', c.id), cleanCategory, { merge: true }),
            8000,
            `Syncing category ${c.name || c.id}`
          );
          count++;
        } catch (itemErr: any) {
          throw new Error(`Write failed on collection "categories", document "${c.id}": ${itemErr.message}`);
        }
      }

      // 3. Sync Banners
      for (const b of (data.banners || [])) {
        const cleanBanner = this._sanitizeDoc(b);
        try {
          await this._withTimeout(
            setDoc(doc(db, 'banners', b.id), cleanBanner, { merge: true }),
            8000,
            `Syncing banner ${b.id}`
          );
          count++;
        } catch (itemErr: any) {
          throw new Error(`Write failed on collection "banners", document "${b.id}": ${itemErr.message}`);
        }
      }

      // 4. Sync Settings
      if (data.settings) {
        const cleanSettings = this._sanitizeDoc(data.settings);
        try {
          await this._withTimeout(
            setDoc(doc(db, 'settings', 'general'), cleanSettings, { merge: true }),
            8000,
            'Syncing store settings'
          );
          count++;
        } catch (itemErr: any) {
          throw new Error(`Write failed on collection "settings", document "general": ${itemErr.message}`);
        }
      }

      return { success: true, count };
    } catch (e: any) {
      console.error('Firestore bulk sync error details:', e);
      const isPermission = e?.code === 'permission-denied' || e?.message?.includes('permission') || e?.message?.includes('Missing or insufficient permissions');
      return { 
        success: false, 
        count, 
        error: isPermission
          ? `Permission Denied: ${e.message}. Cloud Firestore security rules require an authenticated session for jamjam8314@gmail.com.`
          : (e.message || 'Error syncing data.') 
      };
    }
  }
};
