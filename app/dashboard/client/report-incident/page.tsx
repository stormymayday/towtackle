'use client';

import { useState, FormEvent, useCallback } from 'react';
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
    const [isLocating, setIsLocating] = useState(false);

    // Geocode coordinates to human-readable address
    const getAddressFromCoordinates = useCallback(async (latitude: number, longitude: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            
            if (!response.ok) {
                throw new Error('Could not fetch address');
            }
            
            const data = await response.json();
            return data.display_name || 'Unknown Location';
        } catch (err) {
            console.error('Geocoding error:', err);
            return 'Unable to determine exact address';
        }
    }, []);

    // Get current location
    const getCurrentLocation = async () => {
        setIsLocating(true);
        setError(null);

        if (navigator.geolocation) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                const { latitude, longitude } = position.coords;
                const address = await getAddressFromCoordinates(latitude, longitude);

                setLocation({
                    latitude,
                    longitude,
                    address
                });
            } catch (error) {
                console.error('Error getting location:', error);
                setError('Could not retrieve location. Please enter manually.');
            } finally {
                setIsLocating(false);
            }
        } else {
            setError('Geolocation is not supported by this browser.');
            setIsLocating(false);
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Location
                                        </label>
                                        <div className="flex space-x-2">
                                            <div className="relative flex-grow">
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter address"
                                                    value={location.address}
                                                    onChange={(e) => setLocation(prev => ({
                                                        ...prev, 
                                                        address: e.target.value
                                                    }))}
                                                    title={location.address} // Show full address on hover
                                                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm 
                                                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                                                        text-sm 
                                                        overflow-ellipsis overflow-hidden whitespace-nowrap"
                                                />
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={getCurrentLocation}
                                                disabled={isLocating}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                {isLocating ? 'Locating...' : 'Use Current Location'}
                                            </button>
                                        </div>
                                        {location.address && location.address.length > 50 && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                {location.address}
                                            </p>
                                        )}
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