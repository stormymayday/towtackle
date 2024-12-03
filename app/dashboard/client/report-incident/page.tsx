'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createIncident } from '@/lib/firebase';

export default function ReportIncident() {
    const router = useRouter();
    const { user } = useAuth();
    const [location, setLocation] = useState({ 
        latitude: 0, 
        longitude: 0, 
        address: '' 
    });
    const [vehicleType, setVehicleType] = useState('');
    const [issueType, setIssueType] = useState<'towing' | 'breakdown' | 'flat_tire' | 'other'>('other');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Get current location
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        address: '' // You might want to use a geocoding service to get the address
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setError('Could not retrieve location. Please enter manually.');
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Validate input
            if (!user) {
                throw new Error('You must be logged in to report an incident');
            }

            if (!location.latitude || !location.longitude) {
                throw new Error('Please provide a valid location');
            }

            // Create incident
            const incident = await createIncident({
                location,
                vehicleType,
                issueType
            });

            // Redirect to incidents page or show success message
            router.push('/dashboard/client/incidents');
        } catch (error) {
            console.error('Incident reporting error:', error);
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <h2 className="text-3xl font-extrabold text-center text-gray-900">
                                    Report an Incident
                                </h2>
                                
                                {error && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Location
                                        </label>
                                        <div className="mt-1 flex">
                                            <input 
                                                type="text" 
                                                placeholder="Enter address"
                                                value={location.address}
                                                onChange={(e) => setLocation(prev => ({
                                                    ...prev, 
                                                    address: e.target.value
                                                }))}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <button 
                                                type="button"
                                                onClick={getCurrentLocation}
                                                className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Use Current Location
                                            </button>
                                        </div>
                                    </div>

                                    {/* Vehicle Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Vehicle Type
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g., Sedan, Truck, SUV"
                                            value={vehicleType}
                                            onChange={(e) => setVehicleType(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Issue Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Issue Type
                                        </label>
                                        <select 
                                            value={issueType}
                                            onChange={(e) => setIssueType(e.target.value as typeof issueType)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="towing">Towing</option>
                                            <option value="breakdown">Breakdown</option>
                                            <option value="flat_tire">Flat Tire</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* Submit Button */}
                                    <div>
                                        <button 
                                            type="submit" 
                                            disabled={isLoading}
                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            {isLoading ? 'Submitting...' : 'Report Incident'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}