'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { findIncidentsByUser } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';

type Incident = {
    id: string;
    userId: string;
    location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    vehicleType: string;
    issueType: 'towing' | 'breakdown' | 'flat_tire' | 'other';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
};

export default function ClientIncidents() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [isIncidentsLoading, setIsIncidentsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Redirect if not authenticated
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        const fetchIncidents = async () => {
            if (user?.uid) {
                try {
                    setIsIncidentsLoading(true);
                    const userIncidents = await findIncidentsByUser(user.uid);
                    // Convert Timestamp to Date
                    const convertedIncidents = userIncidents.map(incident => ({
                        ...incident,
                        createdAt: incident.createdAt instanceof Timestamp 
                            ? incident.createdAt.toDate() 
                            : incident.createdAt,
                        updatedAt: incident.updatedAt instanceof Timestamp
                            ? incident.updatedAt.toDate()
                            : incident.updatedAt
                    }));
                    setIncidents(convertedIncidents);
                } catch (error) {
                    console.error('Error fetching incidents:', error);
                    setError(error instanceof Error ? error.message : 'Unknown error occurred');
                } finally {
                    setIsIncidentsLoading(false);
                }
            }
        };

        if (user) {
            fetchIncidents();
        }
    }, [user, isLoading, isAuthenticated, router]);

    // Loading state
    if (isLoading || isIncidentsLoading) {
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
                        onClick={() => router.push('/dashboard')}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Status color mapping
    const getStatusColor = (status: Incident['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">My Incidents</h1>
                        <button 
                            onClick={() => router.push('/dashboard/client/report-incident')}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Report New Incident
                        </button>
                    </div>

                    {incidents.length === 0 ? (
                        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                            <p className="text-gray-600">No incidents reported yet.</p>
                            <p className="text-gray-500 mt-2">Click "Report New Incident" to get started.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {incidents.map((incident) => (
                                <div 
                                    key={incident.id} 
                                    className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                                {incident.issueType.replace('_', ' ').toUpperCase()} Incident
                                            </h2>
                                            <p className="text-gray-600 mb-2">
                                                <strong>Location:</strong> {incident.location.address || 'Not specified'}
                                            </p>
                                            <p className="text-gray-600 mb-2">
                                                <strong>Vehicle:</strong> {incident.vehicleType}
                                            </p>
                                            <p className="text-gray-600 mb-2">
                                                <strong>Reported on:</strong> {new Date(incident.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <span 
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}
                                        >
                                            {incident.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}