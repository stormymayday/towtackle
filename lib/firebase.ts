import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
    getFirestore, 
    addDoc, 
    collection, 
    doc, 
    getDocs, 
    updateDoc, 
    deleteDoc 
} from "firebase/firestore";

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
export const addDocument = async (collectionName: string, data: any) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        return docRef.id;
    } catch (error) {
        console.error("Error adding document: ", error);
        throw error;
    }
};

export const getDocuments = async (collectionName: string) => {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting documents: ", error);
        throw error;
    }
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
    try {
        await updateDoc(doc(db, collectionName, docId), data);
    } catch (error) {
        console.error("Error updating document: ", error);
        throw error;
    }
};

export const deleteDocument = async (collectionName: string, docId: string) => {
    try {
        await deleteDoc(doc(db, collectionName, docId));
    } catch (error) {
        console.error("Error deleting document: ", error);
        throw error;
    }
};
