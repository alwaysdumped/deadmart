import { Client } from '@googlemaps/google-maps-services-js';
import config from '../config/env.js';

const client = new Client({});

// Geocode address to get lat/lng
export const geocodeAddress = async (address) => {
  if (!config.googleMapsApiKey) {
    console.warn('⚠️  Google Maps API key not configured. Using mock coordinates.');
    // Return mock coordinates for development
    return {
      lat: 28.6139 + (Math.random() - 0.5) * 0.1,
      lng: 77.2090 + (Math.random() - 0.5) * 0.1,
      formattedAddress: address,
    };
  }

  try {
    const response = await client.geocode({
      params: {
        address,
        key: config.googleMapsApiKey,
      },
    });

    if (response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    }

    throw new Error('Address not found');
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw new Error('Failed to geocode address');
  }
};

// Calculate distance between two points (in km)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};
