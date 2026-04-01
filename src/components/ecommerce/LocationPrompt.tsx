import { useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface LocationPromptProps {
  open: boolean;
  onClose: () => void;
  onDetectGPS: () => Promise<any>;
  onPinCodeSubmit: (pinCode: string) => Promise<any>;
}

const LocationPrompt = ({ open, onClose, onDetectGPS, onPinCodeSubmit }: LocationPromptProps) => {
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGPS = async () => {
    setLoading(true);
    setError("");
    try {
      await onDetectGPS();
    } catch {
      setError("Unable to detect location. Please enter your pin code.");
    }
    setLoading(false);
  };

  const handlePinCode = async () => {
    if (pinCode.length !== 6) {
      setError("Please enter a valid 6-digit pin code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onPinCodeSubmit(pinCode);
    } catch {
      setError("Could not find this pin code. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">Set your delivery location</DialogTitle>
        <DialogDescription className="sr-only">Enter your pin code or use GPS to find items available near you.</DialogDescription>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Set your location</h3>
              <p className="text-sm text-primary-foreground/70">See items available near you</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* GPS Button */}
          <Button
            onClick={handleGPS}
            disabled={loading}
            variant="outline"
            className="w-full h-12 border-primary/30 text-primary hover:bg-primary/5 font-medium gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Detect my location automatically
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Pin Code Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Enter Pin Code</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g. 500033"
                value={pinCode}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setPinCode(v);
                  setError("");
                }}
                className="flex-1"
                maxLength={6}
              />
              <Button onClick={handlePinCode} disabled={loading || pinCode.length !== 6}>
                Apply
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPrompt;
