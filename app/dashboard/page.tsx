'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
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