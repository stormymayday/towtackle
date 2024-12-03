'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createUserDocument } from '@/lib/firebase';

export default function Dashboard() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [userDataLoading, setUserDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Redirect if not authenticated
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        const fetchOrCreateUserData = async () => {
            if (user?.email) {
                try {
                    console.log('Attempting to fetch/create user data for:', user.email);
                    
                    // Try to find or create user document
                    const fetchedUser = await createUserDocument({
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL
                    });

                    console.log('Fetched/Created user data:', fetchedUser);
                    setUserData(fetchedUser);
                } catch (error) {
                    console.error('Error fetching/creating user data:', error);
                    setError(error instanceof Error ? error.message : 'Unknown error occurred');
                } finally {
                    setUserDataLoading(false);
                }
            }
        };

        if (user) {
            fetchOrCreateUserData();
        }
    }, [user, isLoading, isAuthenticated, router]);

    // Loading state
    if (isLoading || userDataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Error handling
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-red-500">{error}</p>
                    <button 
                        onClick={() => router.push('/auth/login')}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    // Main dashboard content
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

                    {/* User Information Card */}
                    {userData && (
                        <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Profile</h2>
                            <div className="space-y-2">
                                <p><strong>Name:</strong> {userData.displayName || 'N/A'}</p>
                                <p><strong>Email:</strong> {userData.email}</p>
                                <p><strong>Role:</strong> {userData.role || 'N/A'}</p>
                                <p><strong>Phone:</strong> {userData.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Client Card */}
                        <div 
                            onClick={() => router.push('/dashboard/client')}
                            className="bg-white overflow-hidden shadow-lg rounded-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="px-6 py-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Client Portal
                                </h3>
                                <p className="text-gray-600">
                                    Request towing services and manage your service history
                                </p>
                            </div>
                        </div>

                        {/* Driver Card */}
                        <div 
                            onClick={() => router.push('/dashboard/driver')}
                            className="bg-white overflow-hidden shadow-lg rounded-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="px-6 py-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Driver Portal
                                </h3>
                                <p className="text-gray-600">
                                    Accept towing requests and manage your jobs
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}