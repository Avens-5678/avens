import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { WifiOff } from "lucide-react";

const OfflineBanner = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 inset-x-0 z-[60] bg-amber-500 text-white text-center py-2 text-xs font-medium flex items-center justify-center gap-2"
      style={{ paddingTop: "calc(0.5rem + var(--safe-area-top))" }}
    >
      <WifiOff className="h-3.5 w-3.5" />
      You're offline — some features may not work
    </div>
  );
};

export default OfflineBanner;
