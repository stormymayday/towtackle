/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { createUserDocument } from '@/lib/firebase';
import { FaUserCircle } from 'react-icons/fa';

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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <div className="flex items-center space-x-4">
                        {userData?.photoURL ? (
                                    <Image 
                                        src={userData.photoURL} 
                                        alt="User Avatar" 
                                        width={40} 
                                        height={40} 
                                        className="rounded-full"
                                    />
                                ) : (
                                    <FaUserCircle className="w-10 h-10 text-gray-500" />
                                )}
                            <span className="text-lg font-medium text-gray-900">{userData?.displayName || 'User'}</span>
                        </div>
                    </div>

                    {/* User Information Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Profile Overview */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile</h2>
                            <div className="space-y-2">
                                <p className="text-gray-700"><strong>Email:</strong> {userData?.email || 'N/A'}</p>
                                <p className="text-gray-700"><strong>Role:</strong> {userData?.role || 'N/A'}</p>
                                <p className="text-gray-700"><strong>Joined:</strong> {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>

                        {/* Client Portal */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Portal</h2>
                            <div className="space-y-3">
                                <Link 
                                    href="/dashboard/client/report-incident"
                                    className="block bg-blue-50 hover:bg-blue-100 p-3 rounded-lg transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-800">Report an Incident</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </Link>
                                <Link 
                                    href="/dashboard/client/incidents"
                                    className="block bg-green-50 hover:bg-green-100 p-3 rounded-lg transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-green-800">View Incidents</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link 
                                    href="/dashboard/profile"
                                    className="block bg-purple-50 hover:bg-purple-100 p-3 rounded-lg transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-purple-800">Edit Profile</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </div>
                                </Link>
                                <Link 
                                    href="/dashboard/settings"
                                    className="block bg-indigo-50 hover:bg-indigo-100 p-3 rounded-lg transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-indigo-800">Account Settings</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}