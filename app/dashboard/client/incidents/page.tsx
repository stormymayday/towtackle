'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { findIncidentsByUser, updateIncident, deleteIncident } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

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
    const [isIncidentsLoading, setIsIncidentsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

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

    const handleEditIncident = async (updatedIncident: Partial<Incident>) => {
        if (!editingIncident) return;

        try {
            const updated = await updateIncident(editingIncident.id, {
                status: updatedIncident.status,
                location: updatedIncident.location,
                vehicleType: updatedIncident.vehicleType,
                issueType: updatedIncident.issueType
            });
            
            // Convert Timestamp to Date if necessary
            const convertedUpdated = {
                ...updated,
                createdAt: updated.createdAt instanceof Timestamp 
                    ? updated.createdAt.toDate() 
                    : updated.createdAt,
                updatedAt: updated.updatedAt instanceof Timestamp
                    ? updated.updatedAt.toDate()
                    : updated.updatedAt
            };
            
            // Update the incidents list
            setIncidents(prev => 
                prev.map(incident => 
                    incident.id === updated.id ? convertedUpdated : incident
                )
            );
            
            // Reset editing state
            setEditingIncident(null);
        } catch (err) {
            console.error('Error updating incident:', err);
            setError(err instanceof Error ? err.message : 'Failed to update incident');
        }
    };

    const handleDeleteIncident = async (incidentId: string) => {
        try {
            await deleteIncident(incidentId);
            
            // Remove the deleted incident from the list
            setIncidents(prev => prev.filter(incident => incident.id !== incidentId));
        } catch (err) {
            console.error('Error deleting incident:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete incident');
        }
    };

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
                                    className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow relative"
                                >
                                    <div className="absolute top-2 right-2 flex space-x-2">
                                        <button 
                                            onClick={() => setEditingIncident(incident)}
                                            className="text-blue-500 hover:text-blue-700"
                                            title="Edit Incident"
                                        >
                                            <FiEdit />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteIncident(incident.id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete Incident"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
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