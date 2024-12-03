import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
    getFirestore, 
    addDoc, 
    collection, 
    doc, 
    getDocs, 
    updateDoc, 
    deleteDoc,
    DocumentData,
    UpdateData,
    QueryDocumentSnapshot,
    DocumentSnapshot
} from "firebase/firestore";
import { CollectionName, User, Incident, ServiceProvider } from "./types";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Utility functions for common Firestore operations
export const addDocument = async <T extends DocumentData>(
    collectionName: CollectionName, 
    data: T
): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        return docRef.id;
    } catch (error) {
        console.error(`Error adding document to ${collectionName}: `, error);
        throw error;
    }
};

export const getDocuments = async <T extends DocumentData>(
    collectionName: CollectionName
): Promise<(T & { id: string })[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data() as T
        }));
    } catch (error) {
        console.error(`Error getting documents from ${collectionName}: `, error);
        throw error;
    }
};

export const updateDocument = async <T extends DocumentData>(
    collectionName: CollectionName, 
    docId: string, 
    data: Partial<T>
): Promise<void> => {
    try {
        const docReference = doc(db, collectionName, docId);
        await updateDoc(docReference, data as UpdateData<T>);
    } catch (error) {
        console.error(`Error updating document in ${collectionName}: `, error);
        throw error;
    }
};

export const deleteDocument = async (
    collectionName: CollectionName, 
    docId: string
): Promise<void> => {
    try {
        const docReference = doc(db, collectionName, docId);
        await deleteDoc(docReference);
    } catch (error) {
        console.error(`Error deleting document from ${collectionName}: `, error);
        throw error;
    }
};

// Helper functions for specific collections
export const addUser = (userData: User): Promise<string> => 
    addDocument<User>('users', userData);

export const addIncident = (incidentData: Incident): Promise<string> => 
    addDocument<Incident>('incidents', incidentData);

export const addServiceProvider = (providerData: ServiceProvider): Promise<string> => 
    addDocument<ServiceProvider>('service_providers', providerData);
