import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";

export const getCurrentLocation = async () => {
  if (Capacitor.isNativePlatform()) {
    const permission = await Geolocation.requestPermissions();
    if (permission.location !== "granted") {
      throw new Error("Location permission denied");
    }
  }

  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };
};

export const watchLocation = (callback: (lat: number, lng: number) => void) => {
  return Geolocation.watchPosition({ enableHighAccuracy: true }, (position) => {
    if (position) {
      callback(position.coords.latitude, position.coords.longitude);
    }
  });
};
