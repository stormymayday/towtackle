/* eslint-disable @typescript-eslint/no-unused-vars */
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    QueryConstraint,
    orderBy,
    Timestamp
} from "firebase/firestore";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut 
} from "firebase/auth";
import { User, 
    Incident, 
    ServiceProvider 
} from "./types";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const getCurrentUser = () => {
    const user = auth.currentUser;
    if (!user) {
        console.error('No authenticated user found');
        throw new Error('Authentication required');
    }
    return user;
};


export const getDocuments = async <T>(
    collectionName: string, 
    ...queryConstraints: QueryConstraint[]
): Promise<(T & { id: string })[]> => {
    try {
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


export const findUserByEmail = async (email: string): Promise<(User & { id: string }) | null> => {
    try {
        console.log('Searching for user with email:', email);
        
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

export const addDocument = async <T>(
    collectionName: string, 
    data: Omit<T, 'id'>
): Promise<string> => {
    try {
        getCurrentUser();

        const docRef = await addDoc(collection(db, collectionName), data);
        return docRef.id;
    } catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
        throw error;
    }
};

export const createUserDocument = async (user: {
    email: string;
    displayName?: string | null;
    photoURL?: string | null;
}): Promise<User> => {
    try {
        console.log('Creating user document for:', user.email);

        const currentUser = getCurrentUser();

        const userData: Omit<User, 'id'> = {
            email: user.email,
            displayName: user.displayName || currentUser.displayName || 'User',
            role: 'client', 
            phoneNumber: currentUser.phoneNumber || '',
            createdAt: new Date()
        };

        const userId = await addDocument<User>('users', userData);
        console.log('New user created with ID:', userId);

        return {
            ...userData,
            id: userId
        };
    } catch (error) {
        console.error('Error creating user document:', error);
        
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


export const findIncidentsByUser = async (userId: string): Promise<Incident[]> => {
    try {
        const currentUser = getCurrentUser();
        
        const q = query(
            collection(db, 'incidents'), 
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp 
                    ? data.createdAt.toDate() 
                    : data.createdAt,
                updatedAt: data.updatedAt instanceof Timestamp 
                    ? data.updatedAt.toDate() 
                    : data.updatedAt
            } as Incident;
        });
    } catch (error) {
        console.error('Error finding incidents by user:', error);
        throw error;
    }
};

export const createIncident = async (incidentData: {
    location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    vehicleType: string;
    issueType: 'towing' | 'breakdown' | 'flat_tire' | 'other';
}): Promise<Incident> => {
    try {
        const currentUser = getCurrentUser();

        const fullIncidentData: Omit<Incident, 'id'> = {
            userId: currentUser.uid,
            location: incidentData.location,
            vehicleType: incidentData.vehicleType,
            issueType: incidentData.issueType,
            status: 'pending',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const incidentId = await addDocument<Incident>('incidents', fullIncidentData);
        console.log('New incident created with ID:', incidentId);

        return {
            ...fullIncidentData,
            id: incidentId,
            createdAt: fullIncidentData.createdAt instanceof Timestamp 
                ? fullIncidentData.createdAt.toDate() 
                : fullIncidentData.createdAt,
            updatedAt: fullIncidentData.updatedAt instanceof Timestamp 
                ? fullIncidentData.updatedAt.toDate() 
                : fullIncidentData.updatedAt
        };
    } catch (error) {
        console.error('Error creating incident:', error);
        throw error;
    }
};

export const updateIncident = async (
    incidentId: string, 
    updateData: Partial<Omit<Incident, 'id' | 'userId' | 'createdAt'>>
): Promise<Incident> => {
    try {
        const currentUser = getCurrentUser();
        const incidentRef = doc(db, 'incidents', incidentId);

        // Verify the incident belongs to the current user
        const incidentDoc = await getDoc(incidentRef);
        if (!incidentDoc.exists() || incidentDoc.data().userId !== currentUser.uid) {
            throw new Error('Incident not found or unauthorized');
        }

        // Prepare update data
        const updatePayload = {
            ...updateData,
            updatedAt: Timestamp.now()
        };

        // Update the document
        await updateDoc(incidentRef, updatePayload);

        // Fetch and return the updated incident
        const updatedDoc = await getDoc(incidentRef);
        const updatedData = updatedDoc.data() as Incident;

        return {
            ...updatedData,
            id: incidentId,
            createdAt: updatedData.createdAt instanceof Timestamp 
                ? updatedData.createdAt.toDate() 
                : updatedData.createdAt,
            updatedAt: updatedData.updatedAt instanceof Timestamp 
                ? updatedData.updatedAt.toDate() 
                : updatedData.updatedAt
        };
    } catch (error) {
        console.error('Error updating incident:', error);
        throw error;
    }
};

export const deleteIncident = async (incidentId: string): Promise<void> => {
    try {
        const currentUser = getCurrentUser();
        const incidentRef = doc(db, 'incidents', incidentId);

        // Verify the incident belongs to the current user
        const incidentDoc = await getDoc(incidentRef);
        if (!incidentDoc.exists() || incidentDoc.data().userId !== currentUser.uid) {
            throw new Error('Incident not found or unauthorized');
        }

        // Delete the document
        await deleteDoc(incidentRef);
    } catch (error) {
        console.error('Error deleting incident:', error);
        throw error;
    }
};

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