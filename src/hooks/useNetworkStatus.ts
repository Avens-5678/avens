import { Network } from "@capacitor/network";
import { useState, useEffect } from "react";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    Network.getStatus().then((status) => setIsOnline(status.connected));

    const handler = Network.addListener("networkStatusChange", (status) => {
      setIsOnline(status.connected);
    });

    return () => {
      handler.then((h) => h.remove());
    };
  }, []);

  return isOnline;
};
