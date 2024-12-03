/* eslint-disable @typescript-eslint/no-unused-vars */
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs,
    addDoc,
    // doc,
    // getDoc,
    // updateDoc,
    // deleteDoc,
    QueryConstraint
} from "firebase/firestore";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut 
} from "firebase/auth";
import { User, 
    // Incident, 
    // ServiceProvider 
} from "./types";

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Utility function to get current user
const getCurrentUser = () => {
    const user = auth.currentUser;
    if (!user) {
        console.error('No authenticated user found');
        throw new Error('Authentication required');
    }
    return user;
};

// Generic document retrieval function
export const getDocuments = async <T>(
    collectionName: string, 
    ...queryConstraints: QueryConstraint[]
): Promise<(T & { id: string })[]> => {
    try {
        // Ensure user is authenticated
        getCurrentUser();

        const collectionRef = collection(db, collectionName);
        const q = queryConstraints.length > 0 
            ? query(collectionRef, ...queryConstraints) 
            : collectionRef;
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as T & { id: string }));
    } catch (error) {
        console.error(`Error fetching documents from ${collectionName}:`, error);
        throw error;
    }
};

// Specialized query functions
export const findUserByEmail = async (email: string): Promise<(User & { id: string }) | null> => {
    try {
        console.log('Searching for user with email:', email);
        
        // Ensure user is authenticated
        getCurrentUser();

        const users = await getDocuments<User>('users', where('email', '==', email));
        
        if (users.length > 0) {
            console.log('User found:', users[0]);
            return users[0];
        }
        
        console.log('No user found with email:', email);
        return null;
    } catch (error) {
        console.error('Error in findUserByEmail:', error);
        throw error;
    }
};

// Generic document addition function
export const addDocument = async <T>(
    collectionName: string, 
    data: Omit<T, 'id'>
): Promise<string> => {
    try {
        // Ensure user is authenticated
        getCurrentUser();

        const docRef = await addDoc(collection(db, collectionName), data);
        return docRef.id;
    } catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
        throw error;
    }
};

// User document creation function
export const createUserDocument = async (user: {
    email: string;
    displayName?: string | null;
    photoURL?: string | null;
}): Promise<User> => {
    try {
        console.log('Creating user document for:', user.email);

        // Ensure user is authenticated
        const currentUser = getCurrentUser();

        // Create new user document
        const userData: Omit<User, 'id'> = {
            email: user.email,
            displayName: user.displayName || currentUser.displayName || 'User',
            role: 'client', // Default role
            phoneNumber: currentUser.phoneNumber || '', // Use phone from auth if available
            createdAt: new Date()
        };

        // Always try to add the document, even if findUserByEmail fails
        const userId = await addDocument<User>('users', userData);
        console.log('New user created with ID:', userId);

        return {
            ...userData,
            id: userId
        };
    } catch (error) {
        console.error('Error creating user document:', error);
        
        // If the error is due to permissions or user not found, 
        // we'll try to create the document without the initial check
        if (error instanceof Error && error.message.includes('Authentication required')) {
            try {
                const userData: Omit<User, 'id'> = {
                    email: user.email,
                    displayName: user.displayName || 'User',
                    role: 'client',
                    phoneNumber: '',
                    createdAt: new Date()
                };

                const userId = await addDocument<User>('users', userData);
                console.log('Fallback user document created with ID:', userId);

                return {
                    ...userData,
                    id: userId
                };
            } catch (fallbackError) {
                console.error('Fallback user document creation failed:', fallbackError);
                throw fallbackError;
            }
        }

        throw error;
    }
};

// Authentication functions
export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        throw error;
    }
};

export const signOutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Sign Out Error:', error);
        throw error;
    }
};

export { db, auth };