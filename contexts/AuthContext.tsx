"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    sendVerificationEmail: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            
            if (!userCredential.user.emailVerified) {
                throw new Error("Please verify your email before logging in.");
            }
            
            setUser(userCredential.user);
        } catch (error) {
            console.error("Login error", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            setUser(userCredential.user);
        } catch (error) {
            console.error("Google login error", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Logout error", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const sendVerificationEmail = async () => {
        if (user && !user.emailVerified) {
            try {
                await sendEmailVerification(user);
            } catch (error) {
                console.error("Error sending verification email:", error);
                throw error;
            }
        }
    };

    const register = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            await sendEmailVerification(userCredential.user);
            setUser(userCredential.user);
            throw new Error("Please check your email for verification link before logging in.");
        } catch (error) {
            console.error("Registration error", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user && user.emailVerified,
                isLoading,
                login,
                logout,
                register,
                loginWithGoogle,
                sendVerificationEmail,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
