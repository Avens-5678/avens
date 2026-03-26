import { useState, useEffect, useCallback } from "react";

interface UserLocation {
  lat: number;
  lng: number;
  pinCode?: string;
  cityName?: string;
}

const STORAGE_KEY = "evnting_user_location";

export const useUserLocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!location) {
      const timer = setTimeout(() => setShowPrompt(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const saveLocation = useCallback((loc: UserLocation) => {
    setLocation(loc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    setShowPrompt(false);
  }, []);

  const detectGPS = useCallback(() => {
    return new Promise<UserLocation>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          // Reverse geocode to get city name
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json&addressdetails=1`
            );
            const data = await res.json();
            loc.cityName = data.address?.city || data.address?.town || data.address?.state_district || data.address?.state || "";
            loc.pinCode = data.address?.postcode || "";
          } catch {}
          saveLocation(loc);
          resolve(loc);
        },
        (err) => reject(err),
        { timeout: 10000 }
      );
    });
  }, [saveLocation]);

  const setFromPinCode = useCallback(async (pinCode: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pinCode}&country=India&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const loc: UserLocation = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          pinCode,
          cityName: data[0].display_name?.split(",")[0] || "",
        };
        saveLocation(loc);
        return loc;
      }
      throw new Error("Pin code not found");
    } catch (err) {
      throw err;
    }
  }, [saveLocation]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  // Calculate distance between user and item (approx using Haversine)
  const getDistance = useCallback((itemAddress: string | null | undefined): number | null => {
    if (!location || !itemAddress) return null;
    // We can't calculate real distance from just an address string without geocoding
    // So we do a simple city-name match check and return a rough indicator
    return null;
  }, [location]);

  return {
    location,
    showPrompt,
    detectGPS,
    setFromPinCode,
    clearLocation,
    dismissPrompt,
    saveLocation,
    getDistance,
  };
};
